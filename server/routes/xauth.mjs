import express from 'express';
import { TwitterApi } from 'twitter-api-v2';

const router = express.Router();

export default function (db) {
    // X API configuration
    const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
    const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
    const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;
    const DEFAULT_TOKEN_EXPIRY = 7200; // 2 hours in seconds
    const TEMP_AUTH_EXPIRY = 10 * 60 * 1000; // 10 minutes in milliseconds

    async function refreshAccessToken(auth) {
        const client = new TwitterApi({
            clientId: TWITTER_CLIENT_ID,
            clientSecret: TWITTER_CLIENT_SECRET
        });

        try {
            const { accessToken, refreshToken: newRefreshToken, expiresIn } =
                await client.refreshOAuth2Token(auth.refreshToken);

            const expiresAt = new Date(Date.now() + (expiresIn || DEFAULT_TOKEN_EXPIRY) * 1000);

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

            return { accessToken, expiresAt };
        } catch (error) {
            // If refresh fails, the token might have been revoked
            // Remove the invalid auth entry
            await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
            throw error;
        }
    }

    // Cleanup expired temporary auth data
    async function cleanupTempAuth() {
        const expiryTime = new Date(Date.now() - TEMP_AUTH_EXPIRY);
        await db.collection('x_auth_temp').deleteMany({
            createdAt: { $lt: expiryTime }
        });
    }
    router.get('/auth-url', async (req, res) => {
        try {
            const { walletAddress, avatarId } = req.query;
            if (!walletAddress || !avatarId) {
                return res.status(400).json({ error: 'Missing wallet address or avatar ID' });
            }

            // Remove any existing auth entry for this avatar before starting new auth flow
            await db.collection('x_auth').deleteOne({ avatarId });

            const client = new TwitterApi({
                clientId: TWITTER_CLIENT_ID,
                clientSecret: TWITTER_CLIENT_SECRET
            });

            const stateData = encodeURIComponent(JSON.stringify({ walletAddress, avatarId }));

            const { url, codeVerifier, state } = await client.generateOAuth2AuthLink(
                TWITTER_CALLBACK_URL,
                {
                    scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
                    state: stateData
                }
            );

            await cleanupTempAuth(db); // Cleanup old temporary auth data

            await db.collection('x_auth_temp').updateOne(
                { avatarId },
                {
                    $set: {
                        codeVerifier,
                        createdAt: new Date()
                    }
                },
                { upsert: true }
            );

            res.json({ url });
        } catch (error) {
            console.error('Error generating auth URL:', error);
            res.status(500).json({ error: error.message });
        }
    });

    router.get('/callback', async (req, res) => {
        try {
            const { code, state } = req.query;
            if (!code || !state) {
                throw new Error('Missing code or state parameter');
            }

            let stateData;
            try {
                stateData = JSON.parse(decodeURIComponent(state));
            } catch (error) {
                console.error('State parsing error:', error, 'State value:', state);
                throw new Error('Invalid state parameter');
            }

            const { walletAddress, avatarId } = stateData;
            if (!walletAddress || !avatarId) {
                throw new Error('Missing wallet address or avatar ID in state');
            }

            const storedAuth = await db.collection('x_auth_temp').findOne({ avatarId });

            if (!storedAuth?.codeVerifier) {
                throw new Error('Auth session expired');
            }

            const client = new TwitterApi({
                clientId: TWITTER_CLIENT_ID,
                clientSecret: TWITTER_CLIENT_SECRET
            });

            const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
                code,
                codeVerifier: storedAuth.codeVerifier,
                redirectUri: TWITTER_CALLBACK_URL
            });

            await db.collection('x_auth').updateOne(
                { avatarId },
                {
                    $set: {
                        accessToken,
                        refreshToken,
                        expiresAt: new Date(Date.now() + (expiresIn || DEFAULT_TOKEN_EXPIRY) * 1000),
                        walletAddress,
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            await db.collection('x_auth_temp').deleteOne({ avatarId });

            res.send(`
            <script>
                window.opener.postMessage({ type: 'X_AUTH_SUCCESS' }, '*');
                window.close();
            </script>
        `);

        } catch (error) {
            console.error('OAuth callback error:', error);
            res.send(`
            <script>
                window.opener.postMessage({ 
                    type: 'X_AUTH_ERROR', 
                    error: '${error.message}'
                }, '*');
                window.close();
            </script>
        `);
        }
    });


    router.get('/status/:avatarId', async (req, res) => {
        try {
            const auth = await db.collection('x_auth').findOne({
                avatarId: req.params.avatarId
            });

            if (!auth) {
                return res.json({ authorized: false });
            }

            if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
                try {
                    const { expiresAt } = await refreshAccessToken(auth);
                    return res.json({ authorized: true, expiresAt });
                } catch (error) {
                    // Token refresh failed - auth has been deleted in refreshAccessToken
                    return res.json({ 
                        authorized: false, 
                        error: 'Token invalid or revoked',
                        requiresReauth: true 
                    });
                }
            }

            // Verify the token is still valid by making a test API call
            try {
                const client = new TwitterApi(auth.accessToken);
                await client.v2.me(); // Light API call to verify token
                
                res.json({
                    authorized: new Date() < new Date(auth.expiresAt),
                    expiresAt: auth.expiresAt
                });
            } catch (error) {
                // If the API call fails, the token is invalid/revoked
                await db.collection('x_auth').deleteOne({ avatarId: req.params.avatarId });
                res.json({ 
                    authorized: false, 
                    error: 'Token invalid or revoked',
                    requiresReauth: true 
                });
            }
        } catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Update verify-wallet route similarly to status route
    router.get('/verify-wallet/:avatarId', async (req, res) => {
        try {
            const auth = await db.collection('x_auth').findOne({
                avatarId: req.params.avatarId
            });

            if (!auth) {
                return res.json({ authorized: false });
            }

            if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
                try {
                    const { expiresAt } = await refreshAccessToken(auth);
                    return res.json({
                        authorized: true,
                        walletAddress: auth.walletAddress,
                        expiresAt
                    });
                } catch (error) {
                    return res.json({
                        authorized: false,
                        error: 'Token invalid or revoked',
                        requiresReauth: true
                    });
                }
            }

            // Verify the token is still valid
            try {
                const client = new TwitterApi(auth.accessToken);
                await client.v2.me();
                
                res.json({
                    authorized: new Date() < new Date(auth.expiresAt),
                    walletAddress: auth.walletAddress,
                    expiresAt: auth.expiresAt
                });
            } catch (error) {
                await db.collection('x_auth').deleteOne({ avatarId: req.params.avatarId });
                res.json({
                    authorized: false,
                    error: 'Token invalid or revoked',
                    requiresReauth: true
                });
            }
        } catch (error) {
            console.error('Wallet verification error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}