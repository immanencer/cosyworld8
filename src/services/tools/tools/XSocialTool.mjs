import { BasicTool } from '../BasicTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';
import { encrypt, decrypt } from '../../utils/encryption.mjs';
import { act } from 'react';

let mongoClient = null;
const statusCache = new Map(); // avatarId -> { timestamp, data }

export class XSocialTool extends BasicTool {
    constructor(services) {
        super(services);
        this.databaseService = services.databaseService;
        this.avatarService = services.avatarService;
        this.aiService = services.aiService;
        this.memoryService = services.memoryService;
        this.conversationManager = services.conversationManager;
        this.promptService = services.promptService;
        this.creationService = services.creationService;
        
        this.replyNotification = true;
        this.emoji = '🐦';
        this.name = 'x';
        this.description = 'Manage X social interactions (post, reply, quote, follow, like, repost, block) using avatar context.';
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
        const db = this.databaseService.getDatabase();
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

        const db = this.databaseService.getDatabase();
        const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
        if (!auth) return { timeline: [], notifications: [], userId: null };

        const twitterClient = new TwitterApi(decrypt(auth.accessToken));
        const v2Client = twitterClient.v2;

        const userData = await v2Client.me();
        const userId = userData.data.id;

        const timelineResp = await v2Client.userTimeline(userId, { max_results: 30 });
        const notificationsResp = await v2Client.userMentionTimeline(userId, { max_results: 30 });

        const timeline = timelineResp?.data?.data?.map(t => ({
            id: t.id,
            text: t.text,
            user: t.author_id,
            isOwn: t.author_id === userId
        })) || [];

        const notifications = notificationsResp?.data?.data?.map(n => ({
            id: n.id,
            text: n.text,
            user: n.author_id,
            isOwn: n.author_id === userId
        })) || [];

        // Save all tweets to DB
        const allTweets = [...timeline, ...notifications];
        for (const tweet of allTweets) {
            if (!tweet?.id) continue;
            await db.collection('social_posts').updateOne(
                { tweetId: tweet.id },
                {
                    $set: {
                        tweetId: tweet.id,
                        content: tweet.text,
                        userId: tweet.user,
                        isOwn: tweet.isOwn,
                        avatarId: avatar._id,
                        timestamp: new Date(),
                        postedToX: tweet.isOwn
                    }
                },
                { upsert: true }
            );
        }

        const data = { timeline, notifications, userId };
        statusCache.set(avatar._id.toString(), { timestamp: now, data });
        return data;
    }

    async execute(message, params, avatar) {
        try {
            if (!params.length) {
                params = ['browse'];
            }

            const db = this.databaseService.getDatabase();
            const authRecord = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            const encryptedToken = authRecord?.accessToken;
            if (!encryptedToken) return '❌ X authorization required. Please connect your account.';
            const twitterClient = new TwitterApi(decrypt(encryptedToken));
            const v2Client = twitterClient.v2;
            const command = params[0].toLowerCase();

            if (!(await this.isAuthorized(avatar))) return '❌ X authorization required. Please connect your account.';

            if (command === 'browse') {
                this.replyNotification = true;
                const context = await this.conversationManager.getChannelContext(message.channel.id);
                const { timeline, notifications, userId } = await this.getXTimelineAndNotifications(avatar);

                const actions = await this.generateSocialActions(avatar, context, timeline, notifications, userId);
                let results = [];
                actions.actions = actions.actions.sort(() => Math.random() - 0.5).slice(0, 3);
                const isValidId = (id) => typeof id === 'string' && /^\d+$/.test(id);

                const me = await v2Client.me();
                const myUserId = me.data.id;

                for (const action of actions.actions) {
                    const tweeturl = action.tweetId ? `[post](https://x.com/ratimics/status/${action.tweetId})` : '';
                    try {
                        switch (action.type) {
                            case 'post':
                                await v2Client.tweet(action.content);
                                await db.collection('social_posts').insertOne({ avatarId: avatar._id, content: action.content, timestamp: new Date(), postedToX: true });
                                results.push(`✨ Sent ${tweeturl}: "${action.content}"`);
                                break;
                            case 'reply':
                                if (!isValidId(action.tweetId)) { results.push(`❌ Invalid tweetId for reply: ${action.tweetId}`); break; }
                                await v2Client.reply(action.content, action.tweetId);
                                results.push(`↩️ Replied to ${tweeturl}: "${action.content}"`);
                                break;
                            case 'quote':
                                if (!isValidId(action.tweetId)) { results.push(`❌ Invalid tweetId for quote: ${action.tweetId}`); break; }
                                await v2Client.tweet({ text: action.content, quote_tweet_id: action.tweetId });
                                results.push(`📜 Quoted ${tweeturl}: "${action.content}"`);
                                break;
                            case 'follow':
                                if (!isValidId(action.userId)) { results.push(`❌ Invalid userId for follow: ${action.userId}`); break; }
                                await v2Client.follow(action.userId);
                                results.push(`➕ Followed user ${action.userId}`);
                                break;
                            case 'like':
                                if (!isValidId(action.tweetId)) { results.push(`❌ Invalid tweetId for like: ${action.tweetId}`); break; }
                                await v2Client.like(myUserId, action.tweetId);
                                results.push(`❤️ Liked ${tweeturl}`);
                                break;
                            case 'repost':
                                if (!isValidId(action.tweetId)) { results.push(`❌ Invalid tweetId for repost: ${action.tweetId}`); break; }
                                await v2Client.retweet(myUserId, action.tweetId);
                                results.push(`🔄 Reposted ${tweeturl}`);
                                break;
                            case 'block':
                                if (!isValidId(action.userId)) { results.push(`❌ Invalid userId for block: ${action.userId}`); break; }
                                await v2Client.block(myUserId, action.userId);
                                results.push(`🚫 Blocked user ${action.userId}`);
                                break;
                        }
                    } catch (error) {
                        if (action.type === 'repost') {
                            this.logger.error(`Repost failed. Params: myUserId=${myUserId}, tweetId=${action.tweetId}`);
                            this.logger.error(`Error stack: ${error.stack}`);
                        }
                        results.push(`❌ ${action.type} failed: ${error.message}`);
                    }
                }
                return results.map(T => `-# [${T}]`).join('\n');
            }

            if (command === 'post') {
                let content = params.slice(1).join(' ');
                if (!content) return '❌ Please provide content to post.';

                // Remove XML/HTML-like tags
                content = content.replace(/<[^>]*>/g, '');
                // Remove URLs
                content = content.replace(/https?:\/\/\S+/gi, '');

                if (!content.trim()) return '❌ Content is empty after filtering.';
                if (content.length > 280) return `❌ Message too long (${content.length}/280). Trim by ${content.length - 280}.`;

                const result = await v2Client.tweet(content);
                if (!result) return '-# [ ❌ Failed to post to X. ]';
                const tweetId = result.data.id;
                const tweetUrl = `https://x.com/ratimics/status/${tweetId}`;
                await db.collection('social_posts').insertOne({ avatarId: avatar._id, content, timestamp: new Date(), postedToX: true, tweetId });
                return `-# ✨ [ [Posted to X](${tweetUrl}) ] `;
            }

            return '❌ Unknown command. Use: browse or post <message>';
        } catch (error) {
            return `❌ Error: ${error.message}`;
        }
    }

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
- "content": text for post/reply/quote (max 280 chars), or null if not applicable
- "tweetId": the Tweet ID for reply/quote/like/repost, or null if not applicable
- "userId": the User ID for follow/block, or null if not applicable

Only output the JSON object, no commentary.`.trim();

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
                                content: { type: "string", nullable: true },
                                tweetId: { type: "string", nullable: true },
                                userId: { type: "string", nullable: true }
                            },
                            required: ["type", "content", "tweetId", "userId"],
                            additionalProperties: false
                        }
                    }
                },
                required: ["actions"],
                additionalProperties: false
            }
        };

        const actions = await this.creationService.executePipeline({
            prompt,
            schema
        });

        return actions;
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
        return 'Manage X interactions: browse timeline/notifications or post a message.';
    }

    async getSyntax() {
        return `${this.emoji} [browse|post <message>]`;
    }

    async close() {
        if (mongoClient) await mongoClient.close();
        mongoClient = null;
    }
}
