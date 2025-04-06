import { BasicTool } from '../BasicTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';
import { encrypt, decrypt } from '../../utils/encryption.mjs';
import { act } from 'react';

let mongoClient = null;
const statusCache = new Map(); // avatarId -> { timestamp, data }

export class XSocialTool extends BasicTool {
    constructor(services) {
        super(services, [
            'avatarService',
            'databaseService',
            'aiService',
            'memoryService',
            'conversationManager',
        ]);
        this.replyNotification = true;
        this.emoji = '🐦';
        this.name = 'x';
        this.description = 'Manage X social interactions (post, reply, quote, follow, like, repost, block) using avatar context.';
    }

    async getMongoClient() {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.MONGO_URI);
            await mongoClient.connect();
        }
        return mongoClient;
    }

    async refreshAccessToken(db, auth) {
        const client = new TwitterApi({ clientId: process.env.X_CLIENT_ID, clientSecret: process.env.X_CLIENT_SECRET });
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(decrypt(auth.refreshToken));
        const expiresAt = new Date(Date.now() + (expiresIn * 1000) - 300000);
        await db.collection('x_auth').updateOne(
            { avatarId: auth.avatarId },
            { $set: { accessToken: encrypt(accessToken), refreshToken: encrypt(newRefreshToken), expiresAt, updatedAt: new Date() } }
        );
        return accessToken;
    }

    async isAuthorized(avatar) {
        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);
        const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
        if (!auth?.accessToken) return false;
        if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
            try { await this.refreshAccessToken(db, auth); return true; } catch { return false; }
        }
        return new Date() < new Date(auth.expiresAt);
    }

    async getXTimelineAndNotifications(avatar) {
        const now = Date.now();
        const cached = statusCache.get(avatar._id.toString());
        if (cached && (now - cached.timestamp < 5 * 60 * 1000)) {
            return cached.data;
        }

        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);
        const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
        if (!auth) return { timeline: [], notifications: [] };

        const twitterClient = new TwitterApi(decrypt(auth.accessToken));
        const v2Client = twitterClient.v2;

        const timeline = await v2Client.userTimeline(await v2Client.me().then(u => u.data.id), { max_results: 10 });
        const notifications = await v2Client.userMentionTimeline(await v2Client.me().then(u => u.data.id), { max_results: 10 });

        const data = {
            timeline: timeline?.data?.data.map(t => ({ id: t.id, text: t.text, user: t.author_id })),
            notifications: notifications.data?.data.map(n => ({ id: n.id, text: n.text, user: n.author_id }))
        };
        statusCache.set(avatar._id.toString(), { timestamp: now, data });
        return data;
    }

    async generateSocialActions(avatar, context, timeline, notifications) {
        const memories = await this.memoryService.getMemories(avatar._id, 20);
        const systemPrompt = await this.services.promptService.getBasicSystemPrompt(avatar);

        const prompt = `
${systemPrompt}

You are an AI social media agent managing an avatar's X (Twitter) account.

Your task is to generate a list of social actions the avatar should perform next.

Use the following context:

Memories:
${memories.map(m => m.content).join('\n')}

Channel Context:
${context}

Recent Timeline:
${JSON.stringify(timeline)}

Recent Notifications:
${JSON.stringify(notifications)}

Generate a JSON array of actions. Each action must have:
- "type": one of post, reply, quote, follow, like, repost, block
- "content": text for post/reply/quote (max 280 chars), or null if not applicable
- "tweetId": the Tweet ID for reply/quote/like/repost, or null if not applicable
- "userId": the User ID for follow/block, or null if not applicable

Only output the JSON object, no commentary.
        `.trim();

        const schema = {
            name: 'rati-x-social-actions',
            strict: true,
            schema: {
                type: "object",
                properties: {
                    actions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string", enum: ["post", "reply", "quote", "follow", "like", "repost", "block"] },
                                content: { type: "string", nullable: true, description: "Text for post/reply/quote (max 280 chars) or null" },
                                tweetId: { type: "string", nullable: true, description: "Tweet ID for reply/quote/like/repost or null" },
                                userId: { type: "string", nullable: true, description: "User ID for follow/block or null" }
                            },
                            required: ["type", "content", "tweetId", "userId"],
                            additionalProperties: false,
                        }
                    }
                },
                required: ["actions"],
                additionalProperties: false,
            }
        };

        const actions = await this.services.creationService.executePipeline({
            prompt,
            schema
        });

        return actions;
    }

    async execute(message, params, avatar) {
        try {
            if (!params.length) {
                params = ['auto'];
            }

            const client = await this.getMongoClient();
            const db = client.db(process.env.MONGO_DB_NAME);
            const authRecord = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            const encryptedToken = authRecord?.accessToken;
            if (!encryptedToken) return '❌ X authorization required. Please connect your account.';
            const twitterClient = new TwitterApi(decrypt(encryptedToken));
            const v2Client = twitterClient.v2;
            const command = params[0].toLowerCase();

            if (!(await this.isAuthorized(avatar))) return '❌ X authorization required. Please connect your account.';

            if (command === 'status') {
                this.replyNotification = false;
                const { timeline, notifications } = await this.getXTimelineAndNotifications(avatar);
                return `📡 X Status\nTimeline: \n${timeline.map(t => t.text).join(' | ')}\nNotifications: ${notifications.map(n => n.text).join(' | ')}`;
            }

            if (command === 'post') {
                this.replyNotification = true;
                const content = params.slice(1).join(' ');
                if (content.length > 280) return `❌ Message too long (${content.length}/280). Trim by ${content.length - 280}.`;
                await v2Client.tweet(content);
                await db.collection('social_posts').insertOne({ avatarId: avatar._id, content, timestamp: new Date(), postedToX: true });
                return `✨ Posted: "${content}" (${content.length}/280)`;
            }

            if (command === 'auto') {
                this.replyNotification = true;
                const context = await this.conversationManager.getChannelContext(message.channel.id); // Assuming a similar method
                const { timeline, notifications } = await this.getXTimelineAndNotifications(avatar);
                const actions = await this.generateSocialActions(avatar, context, timeline, notifications);
                let results = [];


                for (const action of actions.actions) {
                    const tweeturl = `[post](https://x.com/ratimics/status/${action.tweetId})`;
                    try {
                        switch (action.type) {
                            case 'post':
                                await v2Client.tweet(action.content);
                                await db.collection('social_posts').insertOne({ avatarId: avatar._id, content: action.content, timestamp: new Date(), postedToX: true });
                                results.push(`✨ Posted: "${action.content}"`);
                                break;
                            case 'reply':
                                await v2Client.reply(action.content, action.tweetId);
                                results.push(`↩️ Replied to ${tweeturl}: "${action.content}"`);
                                break;
                            case 'quote':
                                await v2Client.tweet({ text: action.content, quote_tweet_id: action.tweetId });
                                results.push(`📜 Quoted ${tweeturl}: "${action.content}"`);
                                break;
                            case 'follow':
                                await v2Client.follow(action.userId);
                                results.push(`➕ Followed user ${action.userId}`);
                                break;
                            case 'like':
                                await v2Client.like(await v2Client.me().then(u => u.data.id), action.tweetId);
                                results.push(`❤️ Liked ${tweeturl}`);
                                break;
                            case 'repost':
                                await v2Client.retweet(await v2Client.me().then(u => u.data.id), action.tweetId);
                                results.push(`🔄 Reposted ${tweeturl}`);
                                break;
                            case 'block':
                                await v2Client.block(await v2Client.me().then(u => u.data.id), action.userId);
                                results.push(`🚫 Blocked user ${action.userId}`);
                                break;
                        }
                    } catch (error) {
                        results.push(`❌ ${action.type} failed: ${error.message}`);
                    }
                }
                return results.map(T => `-# [${T}]`).join('\n');
            }

            return '❌ Unknown command. Use: status, post <message>, or auto';
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

    async getToolStatusForAvatar(avatar) {
        const authorized = await this.isAuthorized(avatar);
        if (!authorized) {
            return { visible: false, info: '' };
        }

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

    getDescription() {
        return 'Manage X interactions: status (timeline/notifications), post <message>, auto (AI-driven actions).';
    }

    async getSyntax() {
        return `${this.emoji} [status|post <message>|auto]`;
    }

    async close() {
        if (mongoClient) await mongoClient.close();
        mongoClient = null;
    }
}
