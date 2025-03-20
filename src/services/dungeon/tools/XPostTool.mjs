import { BaseTool } from './BaseTool.mjs';
import { TwitterApi } from 'twitter-api-v2';
import { MongoClient } from 'mongodb';
import { encrypt, decrypt } from 'crypto'; // Assuming a crypto module for encryption

// Singleton MongoClient for connection pooling
let mongoClient = null;

export class XPostTool extends BaseTool {
    constructor(dungeonService) {
        super(dungeonService);
        this.emoji = '🐦';
        this.name = 'post';
        this.description = 'Post a relevant message to X/Twitter with preview option.';
    }

    // Initialize MongoClient singleton
    async getMongoClient() {
        if (!mongoClient) {
            mongoClient = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
            await mongoClient.connect();
        }
        return mongoClient;
    }

    async refreshAccessToken(db, auth) {
        try {
            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(
                decrypt(auth.refreshToken) // Decrypt stored refresh token
            );

            const expiresAt = new Date(Date.now() + (expiresIn * 1000) - 300000); // 5-min buffer

            // Encrypt tokens before storing
            await db.collection('x_auth').updateOne(
                { avatarId: auth.avatarId },
                {
                    $set: {
                        accessToken: encrypt(accessToken),
                        refreshToken: encrypt(newRefreshToken),
                        expiresAt,
                        updatedAt: new Date()
                    }
                }
            );

            return accessToken; // Return unencrypted for immediate use
        } catch (error) {
            if (error.code === 401 || error.message?.includes('invalid_grant')) {
                await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
                throw new Error('X authorization expired. Please reconnect your account.');
            }
            this.dungeonService.logger.error(`Error refreshing token: ${error.message}`, { error });
            throw error;
        }
    }

    async isAuthorized(avatar) {
        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);

        try {
            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            if (!auth?.accessToken) return false;

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
            this.dungeonService.logger.error(`Error checking X authorization: ${error.message}`, { error });
            return false;
        }
    }

    async execute(message, params, avatar) {
        if (!params || params.length === 0) {
            return '❌ Please include a message to post.';
        }

        const client = await this.getMongoClient();
        const db = client.db(process.env.MONGO_DB_NAME);
        const messageText = params.join(' ');
        const charCount = messageText.length;
        let xStatus = false;

        // Character count feedback
        if (charCount > 280) {
            return `❌ Message exceeds X limit of 280 characters. Current length: ${charCount}. Trim by ${charCount - 280} characters.`;
        }

        try {
            const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
            if (!auth?.accessToken) {
                return '❌ X authorization not found. Please connect your account.';
            }

            let accessToken = decrypt(auth.accessToken); // Decrypt for use
            const now = new Date();
            const expiry = new Date(auth.expiresAt);

            if (now >= expiry) {
                if (!auth.refreshToken) {
                    return '❌ X authorization expired. Please reconnect your account.';
                }
                accessToken = await this.refreshAccessToken(db, auth);
            }

            const twitterClient = new TwitterApi(accessToken);
            const v2Client = twitterClient.v2;

            // Preview option (simplified for this example)
            if (params.includes('--preview')) {
                return `📝 Preview: "${messageText}" (${charCount}/280 characters). Use 🐦 <message> --post to send.`;
            }

            await v2Client.tweet(messageText);
            xStatus = true;

            await db.collection('social_posts').insertOne({
                avatarId: avatar._id,
                content: messageText,
                timestamp: new Date(),
                postedToX: xStatus,
                likes: 0,
                reposts: 0
            });

            return xStatus 
                ? `✨ Posted to X and feed: "${messageText}" (${charCount}/280)` 
                : `📱 Posted to feed: "${messageText}" (${charCount}/280)`;

        } catch (error) {
            if (error.code === 401) {
                return '❌ X authorization invalid. Please reconnect your account.';
            }
            this.dungeonService.logger.error(`Error posting to X: ${error.message}`, { error });
            return `❌ Failed to post to X: ${error.message}`;
        }
    }

    getDescription() {
        return 'Post a message to X/Twitter (requires authorization). Use --preview to see before posting.';
    }

    getSyntax() {
        return '🐦 <message> [--preview | --post]';
    }

    // Cleanup method for application shutdown (optional)
    async close() {
        if (mongoClient) {
            await mongoClient.close();
            mongoClient = null;
        }
    }
}

// Ensure indexes for performance
async function ensureIndexes() {
    const client = await new XPostTool({}).getMongoClient();
    const db = client.db(process.env.MONGO_DB_NAME);
    await db.collection('x_auth').createIndex({ avatarId: 1 }, { unique: true });
    await db.collection('social_posts').createIndex({ avatarId: 1, timestamp: -1 });
}
ensureIndexes().catch(console.error);