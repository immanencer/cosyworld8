
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

            // Calculate new expiration date with 5 min buffer
            const expiresAt = new Date(Date.now() + (expiresIn * 1000) - 300000);

            // Update the stored tokens
            await db.collection('x_auth').updateOne(
                { avatarId: auth.avatarId },
                {
                    $set: {
                        accessToken,
                        refreshToken: newRefreshToken,
                        expiresAt,
                        updatedAt: new Date()
                    }
                }
            );

            return accessToken;
        } catch (error) {
            // Handle specific error cases
            if (error.code === 401 || error.message?.includes('invalid_grant')) {
                await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
                throw new Error('X authorization expired. Please reconnect your account.');
            }
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
            const message = params.join(' ');
            let result = message;
            let xStatus = false;

            try {
                if (!auth?.accessToken) {
                    return '❌ X authorization not found. Please connect your account.';
                }

                let accessToken = auth.accessToken;
                const now = new Date();
                const expiry = new Date(auth.expiresAt);

                // Check if token needs refresh
                if (now >= expiry) {
                    if (!auth.refreshToken) {
                        return '❌ X authorization expired. Please reconnect your account.';
                    }
                    try {
                        accessToken = await this.refreshAccessToken(db, auth);
                    } catch (error) {
                        return error.message || '❌ Failed to refresh X authorization. Please reconnect your account.';
                    }
                }

                // Initialize Twitter client with access token
                const twitterClient = new TwitterApi(accessToken);
                const v2Client = twitterClient.v2;

                // Try posting to X with character limit check
                if (message.length > 280) {
                    return '❌ Message exceeds X character limit of 280 characters';
                }
                
                await v2Client.tweet(message);
                xStatus = true;

                // Always store the post
                await db.collection('social_posts').insertOne({
                    avatarId: avatar._id,
                    content: message,
                    timestamp: new Date(),
                    postedToX: xStatus,
                    likes: 0,
                    reposts: 0
                });

                return xStatus ? `✨ Posted to X and feed: ${message}` : `📱 Posted to feed: ${message}`;

            } catch (error) {
                if (error.code === 401) {
                    return '❌ X authorization invalid. Please reconnect your account.';
                }
                this.dungeonService.logger.error(`Error posting to X: ${error.message}`);
                return `❌ Failed to post to X: ${error.message}`;
            }
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
