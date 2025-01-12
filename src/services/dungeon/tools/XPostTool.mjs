import { BaseTool } from './BaseTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';

export class XPostTool extends BaseTool {
    constructor(dungeonService) {
        super(dungeonService);
        this.emoji = '🐦';
    }

    async refreshAccessToken(db, auth) {
        try {
            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            const {
                accessToken,
                refreshToken: newRefreshToken,
                expiresIn
            } = await client.refreshOAuth2Token(auth.refreshToken);

            // Calculate new expiration date
            const expiresAt = new Date(Date.now() + expiresIn * 1000);

            // Update the stored tokens
            await db.collection('x_auth').updateOne(
                { avatarId: auth.avatarId },
                {
                    $set: {
                        accessToken,
                        refreshToken: newRefreshToken,
                        expiresAt
                    }
                }
            );

            return accessToken;
        } catch (error) {
            this.dungeonService.logger.error(`Error refreshing token: ${error.message}`);
            throw error;
        }
    }

    async isAuthorized(avatar) {
        const client = new MongoClient(process.env.MONGO_URI);
        try {
            await client.connect();
            const db = client.db(process.env.MONGO_DB_NAME);

            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            if (!auth?.accessToken) return false;

            // If token is expired but we have a refresh token, try to refresh
            if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
                try {
                    await this.refreshAccessToken(db, auth);
                    return true;
                } catch (error) {
                    return false;
                }
            }

            return new Date() < new Date(auth.expiresAt);
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

            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });

            if (!auth?.accessToken) {
                return '❌ Not authorized to post on X. Please connect your account first.';
            }

            let accessToken = auth.accessToken;

            // If token is expired but we have a refresh token, try to refresh
            if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
                try {
                    accessToken = await this.refreshAccessToken(db, auth);
                } catch (error) {
                    return '❌ Failed to refresh X authorization. Please reconnect your account.';
                }
            } else if (new Date() >= new Date(auth.expiresAt)) {
                return '❌ X authorization expired. Please reconnect your account.';
            }

            // Initialize Twitter client with access token
            const twitterClient = new TwitterApi(accessToken);
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