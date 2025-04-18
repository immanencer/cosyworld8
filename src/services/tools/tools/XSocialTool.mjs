import { BasicTool } from '../BasicTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { encrypt, decrypt } from '../../utils/encryption.mjs';

export class XSocialTool extends BasicTool {
    /**
     * List of services required by this tool.
     * @type {string[]}
     **/
    static requiredServices = [
        'databaseService',
        'avatarService',
        'aiService',
        'memoryService',
        'conversationManager',
        'promptService',
        'schemaService',
        'xService',
    ];

    // --- Service Initialization ---
    constructor(services) {
        super(services);
        this.replyNotification = true;
        this.emoji = '🐦';
        this.name = 'x';
        this.description = 'Manage X social interactions (post, reply, quote, follow, like, repost, block) using avatar context.';
    }

    // --- Authorization ---
    async isAuthorized(avatar) {
        return await this.xService.isXAuthorized(avatar._id.toString());
    }

    // --- Timeline/Notifications ---
    async getXTimelineAndNotifications(avatar) {
        return await this.xService.getXTimelineAndNotifications(avatar);
    }

    // --- Post Image ---
    async postImageToX(avatar, imageUrl, content) {
        return await this.xService.postImageToX(avatar, imageUrl, content);
    }

    // --- Simulated Social Feed ---
    async simulateSocialPost(avatar, imageUrl, content) {
        const db = this.databaseService.getDatabase();
        const post = {
            avatarId: avatar._id,
            content,
            imageUrl,
            timestamp: new Date(),
            postedToX: false,
            simulated: true
        };
        await db.collection('simulated_social_feed').insertOne(post);
        return `-# [ 🐦 (Simulated) ${avatar.name} posted: ${content}${imageUrl ? ` [Image](${imageUrl})` : ''} ]`;
    }

    async simulateAction(avatar, action) {
        const db = this.databaseService.getDatabase();
        const entry = {
            avatarId: avatar._id,
            action,
            timestamp: new Date(),
            simulated: true
        };
        await db.collection('simulated_social_feed').insertOne(entry);
        return `-# [ 🐦 (Simulated) ${avatar.name} ${action.type}${action.content ? `: ${action.content}` : ''} ]`;
    }

    // --- Main Command Execution ---
    async execute(message, params, avatar) {
        try {
            if (!params.length) params = ['browse'];
            const command = params[0].toLowerCase();
            const authorized = await this.isAuthorized(avatar);

            if (!authorized) {
                // Simulate all X actions for unauthorized avatars
                if (command === 'post') {
                    let content = params.slice(1).join(' ');
                    if (!content) return '-# [ ❌ Please provide content to post. ]';
                    return await this.simulateSocialPost(avatar, null, content);
                }
                // Simulate other actions
                return await this.simulateAction(avatar, { type: command, content: params.slice(1).join(' ') });
            }

            if (command === 'browse') {
                this.replyNotification = true;
                const context = await this.conversationManager.getChannelContext(message.channel.id);
                const { timeline, notifications, userId } = await this.getXTimelineAndNotifications(avatar);
                const actions = await this.generateSocialActions(avatar, context, timeline, notifications, userId);
                let results = [];
                for (const action of actions) {
                    try {
                        let result;
                        switch (action.type) {
                            case 'post':
                                result = await this.xService.postToX(avatar, action.content);
                                break;
                            case 'reply':
                                result = await this.xService.replyToX(avatar, action.tweetId, action.content);
                                break;
                            case 'quote':
                                result = await this.xService.quoteToX(avatar, action.tweetId, action.content);
                                break;
                            case 'follow':
                                result = await this.xService.followOnX(avatar, action.userId);
                                break;
                            case 'like':
                                result = await this.xService.likeOnX(avatar, action.tweetId);
                                break;
                            case 'repost':
                                result = await this.xService.repostOnX(avatar, action.tweetId);
                                break;
                            case 'block':
                                result = await this.xService.blockOnX(avatar, action.userId);
                                break;
                            default:
                                result = `❌ Unknown action type: ${action.type}`;
                        }
                        results.push(result);
                    } catch (error) {
                        results.push(`❌ ${action.type} failed: ${error.message}`);
                    }
                }
                return results.map(T => `-# [ ${T.replace(/\n/g,``)} ]`).join('\n');
            }

            if (command === 'post') {
                let content = params.slice(1).join(' ');
                if (!content) return '-# [ ❌ Please provide content to post. ]';
                content = content.replace(/<[^>]*>/g, '').replace(/https?:\/\/\S+/gi, '');
                if (!content.trim()) return '-# [ ❌ Content is empty after filtering. ]';
                if (content.length > 280) return `-# [ ❌ Message too long (${content.length}/280). Trim by ${content.length - 280}. ]`;
                return await this.xService.postToX(avatar, content);
            }

            return '-# [ ❌ Unknown command. Use: browse or post <message> ]';
        } catch (error) {
            if (error.code === 401) {
                return '-# ❌ [ X authorization required. Please connect your account. ]';
            }
            if (error.code === 403) {
                return `-# ❌ [ X authorization required: ${error.data?.detail || ''} ]`;
            }
            this.logger?.error?.(`Error in XSocialTool: ${error.message}`);
            if (error?.data) {
                this.logger?.error?.(`Error data: ${JSON.stringify(error.data)}`);
            }
            return `-# [ ❌ Unknown error executing command. ]`;
        }
    }

    // --- Social Action Generation ---
    async generateSocialActions(avatar, context, timeline, notifications, userId) {
        const memories = await this.memoryService.getMemories(avatar._id, 20);
        const systemPrompt = await this.promptService.getBasicSystemPrompt(avatar);
        const prompt = `
${systemPrompt}

You are an AI social media agent managing an avatar's X (Twitter) account.
Your task is to generate a list of social actions the avatar should perform next.
Use the following context:
Memories:
${memories.map(m => m.content).join('\n')}
Channel Context:
${context}
Recent Timeline (each tweet has isOwn=true if posted by this avatar, false otherwise):
${JSON.stringify(timeline)}
Recent Notifications (each tweet has isOwn=true if posted by this avatar, false otherwise):
${JSON.stringify(notifications)}
Avoid replying to or quoting tweets where isOwn=true (your own posts).
Generate a JSON array of actions. Each action must have:
- "type": one of post, reply, quote, follow, like, repost, block
- "content": text for post/reply/quote (max 280 chars), always include even if not applicable.
- "tweetId": the Tweet ID for reply/quote/like/repost, or null if not applicable
- "userId": the User ID for follow/block, or null if not applicable
Only output the JSON array, no commentary.`.trim();
        const schema = {
            name: 'rati-x-social-actions',
            strict: true,
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', enum: ['post', 'reply', 'quote', 'follow', 'like', 'repost', 'block'] },
                        content: { type: 'string', nullable: false },
                        tweetId: { type: 'string', nullable: true },
                        userId: { type: 'string', nullable: true }
                    },
                    required: ['type'],
                    additionalProperties: false
                }
            },
        };
        try {
            return await this.schemaService.executePipeline({ prompt, schema });
        } catch (error) {
            this.logger?.error?.(`Error generating social actions: ${error.message}`);
            return [];
        }
    }

    // --- Tool Status & Description ---
    async getToolStatusForAvatar(avatar) {
        const authorized = await this.isAuthorized(avatar);
        if (!authorized) return { visible: false, info: '' };
        try {
            const { timeline } = await this.getXTimelineAndNotifications(avatar);
            const recentPosts = timeline.slice(0, 5).map(t => `- ${t.text}`).join('\n');
            return {
                visible: true,
                info: recentPosts ? `Recent X posts:\n${recentPosts}` : 'No recent posts.'
            };
        } catch (error) {
            return { visible: true, info: 'Error fetching timeline.' };
        }
    }

    async getCommandsDescription(avatar) {
        const status = await this.getToolStatusForAvatar(avatar);
        return `${this.emoji} ${this.name}: ${status.visible ? (status.info || this.getDescription()) : 'Disabled'}`;
    }

    getDescription() {
        return 'Manage X interactions: browse timeline/notifications or post a message.';
    }

    async getSyntax() {
        return `${this.emoji} [browse|post <message>]`;
    }

    async close() {
        // No-op: connection managed by services
    }
}
