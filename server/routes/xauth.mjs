import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import { getDb } from '../services/dbConnection.mjs';

const router = express.Router();

// X API configuration
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL;

// Get authorization URL
router.get('/auth-url', async (req, res) => {
  try {
    const { walletAddress, avatarId } = req.query;
    if (!walletAddress || !avatarId) {
      return res.status(400).json({ error: 'Missing wallet address or avatar ID' });
    }

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

    // Store code verifier temporarily
    const db = await getDb();
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

// Handle OAuth callback
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

    const db = await getDb();

    // Get stored code verifier
    const storedAuth = await db.collection('x_auth_temp').findOne({ avatarId });
    if (!storedAuth?.codeVerifier) {
      throw new Error('Auth session expired');
    }

    const client = new TwitterApi({
      clientId: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET
    });

    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier: storedAuth.codeVerifier,
      redirectUri: TWITTER_CALLBACK_URL
    });

    // Store tokens
    await db.collection('x_auth').updateOne(
      { avatarId },
      {
        $set: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + (expiresIn || 7200) * 1000),
          walletAddress,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    // Cleanup temp auth data
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

// Check auth status
router.get('/status/:avatarId', async (req, res) => {
  try {
    const db = await getDb();
    const auth = await db.collection('x_auth').findOne({
      avatarId: req.params.avatarId
    });

    res.json({
      authorized: !!auth && new Date() < new Date(auth.expiresAt),
      expiresAt: auth?.expiresAt
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add endpoint to verify wallet ownership
router.get('/verify-wallet/:avatarId', async (req, res) => {
  try {
    const db = await getDb();
    const auth = await db.collection('x_auth').findOne({
      avatarId: req.params.avatarId
    });

    res.json({
      authorized: !!auth && new Date() < new Date(auth.expiresAt),
      walletAddress: auth?.walletAddress,
      expiresAt: auth?.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;