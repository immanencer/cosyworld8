import express from 'express';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { TwitterApi } from 'twitter-api-v2';

const DEFAULT_TOKEN_EXPIRY = 7200; // 2 hours in seconds

// Helper: verify that the provided signature (base64) is valid for the challenge message and wallet address.
function verifyWalletSignature(message, signature, publicKeyStr) {
    try {
        const publicKey = new PublicKey(publicKeyStr).toBytes();
        const messageUint8 = new TextEncoder().encode(message);
        const signatureUint8 = Uint8Array.from(Buffer.from(signature, 'base64'));
        return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKey);
    } catch (err) {
        console.error('Signature verification error:', err);
        return false;
    }
}

export default function xauthRoutes(db) {
    const router = express.Router();

    async function refreshAccessToken(auth) {
        const client = new TwitterApi({
            clientId: process.env.X_CLIENT_ID,
            clientSecret: process.env.X_CLIENT_SECRET
        });

        try {
            const { accessToken, refreshToken: newRefreshToken, expiresIn } =
                await client.refreshOAuth2Token(auth.refreshToken);

            const expiresAt = new Date(
                Date.now() + (expiresIn || DEFAULT_TOKEN_EXPIRY) * 1000
            );

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
            if (error.code === 401 || error.message?.includes('invalid_grant')) {
                await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
            }
            throw error;
        }
    }

    // NEW: Generate an auth URL that embeds wallet data and signature in state
    router.get('/auth-url', async (req, res) => {
        try {
            const { avatarId, walletAddress, signature } = req.query;
            if (!avatarId || !walletAddress || !signature) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // Create a temporary session and store a codeVerifier
            const codeVerifier = crypto.randomBytes(32).toString('hex');
            await db.collection('x_auth_temp').updateOne(
                { avatarId },
                { $set: { walletAddress, codeVerifier } },
                { upsert: true }
            );

            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            // Generate OAuth2 auth link (this returns { url, state }).
            const { url } = client.generateOAuth2AuthLink(
                process.env.X_CALLBACK_URL,
                { code_challenge_method: 's256' }
            );

            // Replace the state with our own JSON-encoded object
            const stateData = encodeURIComponent(
                JSON.stringify({ walletAddress, avatarId, signature })
            );
            const finalUrl = url.replace(/state=[^&]+/, `state=${stateData}`);

            res.json({ url: finalUrl });
        } catch (error) {
            console.error('Error generating auth URL:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Updated callback: verify wallet signature before completing OAuth flow
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

            const { walletAddress, avatarId, signature } = stateData;
            if (!walletAddress || !avatarId || !signature) {
                throw new Error('Missing wallet address, avatar ID, or signature in state');
            }

            // Verify wallet signature
            const challengeMessage = `Link X Account for avatar ${avatarId}`;
            if (!verifyWalletSignature(challengeMessage, signature, walletAddress)) {
                throw new Error('Invalid wallet signature');
            }

            // Retrieve temporary session data
            const storedAuth = await db.collection('x_auth_temp').findOne({ avatarId });
            if (!storedAuth?.codeVerifier) {
                throw new Error('Auth session expired');
            }

            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            const { accessToken, refreshToken, expiresIn } =
                await client.loginWithOAuth2({
                    code,
                    codeVerifier: storedAuth.codeVerifier,
                    redirectUri: process.env.X_CALLBACK_URL
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

            // Update the claims database with the wallet that claimed this avatar
            await db.collection('claims').updateOne(
                { avatarId },
                { $set: { walletAddress, claimedAt: new Date() } },
                { upsert: true }
            );

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

            try {
                if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
                    const { expiresAt } = await refreshAccessToken(auth);
                    return res.json({ authorized: true, expiresAt });
                }

                const client = new TwitterApi(auth.accessToken);
                await client.v2.me();

                return res.json({
                    authorized: true,
                    expiresAt: auth.expiresAt
                });
            } catch (error) {
                if (error.code === 401 || error.message?.includes('invalid_grant')) {
                    await db.collection('x_auth').deleteOne({ avatarId: req.params.avatarId });
                    return res.json({
                        authorized: false,
                        error: 'Token invalid or revoked',
                        requiresReauth: true
                    });
                }

                return res.json({
                    authorized: true,
                    expiresAt: auth.expiresAt,
                    error: 'Temporary API error'
                });
            }
        } catch (error) {
            console.error('Status check error:', error);
            res.status(500).json({ error: error.message });
        }
    });

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

    router.post('/disconnect/:avatarId', async (req, res) => {
        try {
            const result = await db.collection('x_auth').deleteOne({
                avatarId: req.params.avatarId
            });

            res.json({
                success: true,
                disconnected: result.deletedCount > 0
            });
        } catch (error) {
            console.error('Disconnect error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}
