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
                const { timeline, notifications, userId } = await this.getXTimelineAndNotifications(avatar);

                const header = `📡 **X Timeline & Notifications**\n**Your X User ID:** ${userId}`;

                const formatTweet = (t) => `[author:${t.user}] ${t.text}`;

                const timelineText = timeline.slice(0, 10).map(formatTweet).join('\n') || 'No recent timeline posts.';
                const notificationsText = notifications.slice(0, 10).map(formatTweet).join('\n') || 'No recent notifications.';

                return `${header}\n\n**Timeline:**\n${timelineText}\n\n**Notifications:**\n${notificationsText}`;
            }

            if (command === 'post') {
                const content = params.slice(1).join(' ');
                if (!content) return '❌ Please provide content to post.';
                if (content.length > 280) return `❌ Message too long (${content.length}/280). Trim by ${content.length - 280}.`;
                const result = await v2Client.tweet(content);
                if (!result) return '-# [ ❌ Failed to post to X. ]';
                const tweetId = result.data.id;
                const tweetUrl = `https://x.com/ratimics/status/${tweetId}`;
                await db.collection('social_posts').insertOne({ avatarId: avatar._id, content, timestamp: new Date(), postedToX: true, tweetId });
                return `-# ✨ [ Posted to X. ]\n>${content} \n-# [view post](${tweetUrl})`;
            }

            return '❌ Unknown command. Use: browse or post <message>';
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
