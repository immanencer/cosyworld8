import express from 'express';
import crypto from 'crypto';
import nacl from 'tweetnacl';
import { TwitterApi } from 'twitter-api-v2';
import ethUtil from 'ethereumjs-util';  // Make sure to install this: npm install ethereumjs-util
import bs58 from 'bs58'; // Make sure to add this import

const DEFAULT_TOKEN_EXPIRY = 7200; // 2 hours in seconds

// Helper: verify that the provided signature is valid for the challenge message and wallet address
function verifyWalletSignature(message, signature, walletAddress) {
    try {
        // Convert message to Uint8Array
        const messageBytes = new TextEncoder().encode(message);
        
        // For Solana addresses, which are base58 encoded
        const publicKey = bs58.decode(walletAddress);
        
        // Convert hex signature to Uint8Array
        const signatureBytes = Buffer.from(signature, 'hex');
        
        // Verify signature using tweetnacl
        const verified = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKey
        );
        
        console.log("Signature verification result:", verified);
        return verified;
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

    router.get('/auth-url', async (req, res) => {
        try {
            const { avatarId } = req.query;
            if (!avatarId) {
                return res.status(400).json({ error: 'Missing avatarId parameter' });
            }

            // Create a temporary session and store a codeVerifier
            const codeVerifier = crypto.randomBytes(32).toString('hex');
            const codeChallenge = crypto
                .createHash('sha256')
                .update(codeVerifier)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            // Generate a state value for security
            const state = crypto.randomBytes(16).toString('hex');

            await db.collection('x_auth_temp').updateOne(
                { avatarId },
                { 
                    $set: { 
                        codeVerifier, 
                        state,
                        createdAt: new Date() 
                    }
                },
                { upsert: true }
            );

            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            const { url } = client.generateOAuth2AuthLink(
                process.env.X_CALLBACK_URL,
                { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] },
                codeChallenge,
                'S256',
                state
            );

            res.json({ url, state });
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

            const client = new TwitterApi({
                clientId: process.env.X_CLIENT_ID,
                clientSecret: process.env.X_CLIENT_SECRET
            });

            const storedAuth = await db.collection('x_auth_temp').findOne({ state });
            if (!storedAuth?.codeVerifier) {
                throw new Error('Auth session expired');
            }

            const { accessToken, refreshToken, expiresIn } =
                await client.loginWithOAuth2({
                    code,
                    codeVerifier: storedAuth.codeVerifier,
                    redirectUri: process.env.X_CALLBACK_URL
                });

            await db.collection('x_auth').updateOne(
                { avatarId: storedAuth.avatarId },
                {
                    $set: {
                        accessToken,
                        refreshToken,
                        expiresAt: new Date(Date.now() + (expiresIn || DEFAULT_TOKEN_EXPIRY) * 1000),
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            await db.collection('x_auth_temp').deleteOne({ state });

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

    router.post('/connect-wallet', async (req, res) => {
        try {
            const { avatarId, walletAddress, signature, message } = req.body;
            
            if (!avatarId || !walletAddress || !signature || !message) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            
            // Verify the signature
            const isValid = verifyWalletSignature(message, signature, walletAddress);
            
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid signature' });
            }
            
            // Update the X auth record with wallet address
            const result = await db.collection('x_auth').updateOne(
                { avatarId }, 
                { $set: { walletAddress, updatedAt: new Date() } }
            );
            
            if (result.matchedCount === 0) {
                return res.status(404).json({ error: 'X auth record not found' });
            }
            
            res.json({ success: true });
        } catch (error) {
            console.error('Connect wallet error:', error);
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
