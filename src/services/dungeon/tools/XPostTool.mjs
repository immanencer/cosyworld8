import { BaseTool } from './BaseTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';

export class XPostTool extends BaseTool {
    constructor(dungeonService) {
        super(dungeonService);
        this.emoji = '🐦';
    }

    async isAuthorized(avatar) {
        const client = new MongoClient(process.env.MONGO_URI);
        try {
            await client.connect();
            const db = client.db(process.env.MONGO_DB_NAME);

            // Check if the avatar has X authorization
            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            return auth?.accessToken && new Date() < new Date(auth.expiresAt);
        } catch (error) {
            this.dungeonService.logger.error(`Error checking X authorization: ${error.message}`);
            return false;
        } finally {
            await client.close();
        }
    }

    async execute(message, params, avatar) {
        if (!params || params.length === 0) {
            return '❌ Please include a message to post.';
        }

        const client = new MongoClient(process.env.MONGO_URI);
        try {
            await client.connect();
            const db = client.db(process.env.MONGO_DB_NAME);

            // Get auth tokens
            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });

            if (!auth?.accessToken) {
                return '❌ Not authorized to post on X. Please connect your account first.';
            }

            if (new Date() > new Date(auth.expiresAt)) {
                return '❌ X authorization expired. Please reconnect your account.';
            }

            // Initialize Twitter client with access token
            const twitterClient = new TwitterApi(auth.accessToken);
            const v2Client = twitterClient.v2;

            // Post the tweet
            const tweet = params.join(' ');
            await v2Client.tweet(tweet);

            return `✅ Posted to X: "${tweet}"`;

        } catch (error) {
            if (error.code === 401) {
                return '❌ X authorization invalid. Please reconnect your account.';
            }
            this.dungeonService.logger.error(`Error posting to X: ${error.message}`);
            return `❌ Failed to post to X: ${error.message}`;
        } finally {
            await client.close();
        }
    }

    getDescription() {
        return 'Post a message to X/Twitter (requires authorization).';
    }

    getSyntax() {
        return '!xpost <message>';
    }
}