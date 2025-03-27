import { BaseTool } from './BaseTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';
import { MemoryService } from '../../memoryService.mjs';
import { AIService } from "../../aiService.mjs";
import { encrypt, decrypt } from '../../utils/encryption.mjs'; // Placeholder for encryption

let mongoClient = null;

export class XSocialTool extends BaseTool {
    constructor(toolService) {
        super(toolService);
        this.emoji = '🐦';
        this.name = 'xsocial';
        this.description = 'Manage X social interactions (post, reply, quote, follow, like, repost, block) using avatar context.';
        this.aiService = new AIService();
        this.memoryService = new MemoryService(this.logger);
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
        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);
        const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
        if (!auth) return { timeline: [], notifications: [] };

        const twitterClient = new TwitterApi(decrypt(auth.accessToken));
        const v2Client = twitterClient.v2;

        const timeline = await v2Client.userTimeline(await v2Client.me().then(u => u.data.id), { max_results: 10 });
        const notifications = await v2Client.mentions(await v2Client.me().then(u => u.data.id), { max_results: 10 });

        return {
            timeline: timeline.data.data.map(t => ({ id: t.id, text: t.text, user: t.author_id })),
            notifications: notifications.data.data.map(n => ({ id: n.id, text: n.text, user: n.author_id }))
        };
    }

    async generateSocialActions(avatar, context, timeline, notifications) {
        const memories = await this.memoryService.getMemories(avatar._id, 5); // Last 5 memories
        const systemPrompt = `You are an AI managing an avatar's X social presence. Based on the avatar's personality, memories, and current X context (timeline and notifications), generate a set of social actions (post, reply, quote, follow, like, repost, block). Return a JSON object with actions, each with a type and relevant details. Keep posts/replies under 280 characters. Example:
        {
          "actions": [
            { "type": "post", "content": "Excited for the journey ahead!" },
            { "type": "reply", "tweetId": "123", "content": "Great point!" },
            { "type": "like", "tweetId": "456" }
          ]
        }`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                actions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            type: { type: "STRING", enum: ["post", "reply", "quote", "follow", "like", "repost", "block"] },
                            content: { type: "STRING", description: "Text for post/reply/quote (max 280 chars)" },
                            tweetId: { type: "STRING", description: "Tweet ID for reply/quote/like/repost" },
                            userId: { type: "STRING", description: "User ID for follow/block" }
                        },
                        required: ["type"]
                    }
                }
            },
            required: ["actions"]
        };

        const aiResponse = await this.aiService.chat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Avatar: ${JSON.stringify(avatar)}\nMemories: ${memories.join('\n')}\nContext: ${context}\nTimeline: ${JSON.stringify(timeline)}\nNotifications: ${JSON.stringify(notifications)}` }
        ], { responseSchema });

        return typeof aiResponse === 'string' ? JSON.parse(aiResponse.match(/\{[\s\S]*\}/)[0]) : aiResponse;
    }

    async execute(message, params, avatar) {
        if (!params.length) return '❌ Please provide a command: status, post <message>, or auto';

        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);
        const twitterClient = new TwitterApi(decrypt((await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() }))?.accessToken));
        const v2Client = twitterClient.v2;
        const command = params[0].toLowerCase();

        if (!(await this.isAuthorized(avatar))) return '❌ X authorization required. Please connect your account.';

        if (command === 'status') {
            const { timeline, notifications } = await this.getXTimelineAndNotifications(avatar);
            return `📡 X Status\nTimeline: ${timeline.map(t => t.text).join(' | ')}\nNotifications: ${notifications.map(n => n.text).join(' | ')}`;
        }

        if (command === 'post') {
            const content = params.slice(1).join(' ');
            if (content.length > 280) return `❌ Message too long (${content.length}/280). Trim by ${content.length - 280}.`;
            await v2Client.tweet(content);
            await db.collection('social_posts').insertOne({ avatarId: avatar._id, content, timestamp: new Date(), postedToX: true });
            return `✨ Posted: "${content}" (${content.length}/280)`;
        }

        if (command === 'auto') {
            const context = await this.getChannelContext(message.channel); // Assuming a similar method
            const { timeline, notifications } = await this.getXTimelineAndNotifications(avatar);
            const actions = await this.generateSocialActions(avatar, context, timeline, notifications);
            let results = [];

            for (const action of actions.actions) {
                try {
                    switch (action.type) {
                        case 'post':
                            await v2Client.tweet(action.content);
                            await db.collection('social_posts').insertOne({ avatarId: avatar._id, content: action.content, timestamp: new Date(), postedToX: true });
                            results.push(`✨ Posted: "${action.content}"`);
                            break;
                        case 'reply':
                            await v2Client.reply(action.content, action.tweetId);
                            results.push(`↩️ Replied to ${action.tweetId}: "${action.content}"`);
                            break;
                        case 'quote':
                            await v2Client.tweet({ text: action.content, quote_tweet_id: action.tweetId });
                            results.push(`📜 Quoted ${action.tweetId}: "${action.content}"`);
                            break;
                        case 'follow':
                            await v2Client.follow(action.userId);
                            results.push(`➕ Followed user ${action.userId}`);
                            break;
                        case 'like':
                            await v2Client.like(await v2Client.me().then(u => u.data.id), action.tweetId);
                            results.push(`❤️ Liked ${action.tweetId}`);
                            break;
                        case 'repost':
                            await v2Client.retweet(await v2Client.me().then(u => u.data.id), action.tweetId);
                            results.push(`🔄 Reposted ${action.tweetId}`);
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
            return results.join('\n');
        }

        return '❌ Unknown command. Use: status, post <message>, or auto';
    }

    getDescription() {
        return 'Manage X interactions: status (timeline/notifications), post <message>, auto (AI-driven actions).';
    }

    getSyntax() {
        return '🐦 status | post <message> | auto';
    }

    async close() {
        if (mongoClient) await mongoClient.close();
        mongoClient = null;
    }
}

async function ensureIndexes() {
    const client = await new XSocialTool({}).getMongoClient();
    const db = client.db(process.env.MONGO_DB_NAME);
    await db.collection('x_auth').createIndex({ avatarId: 1 }, { unique: true });
    await db.collection('social_posts').createIndex({ avatarId: 1, timestamp: -1 });
}
ensureIndexes().catch(console.error);