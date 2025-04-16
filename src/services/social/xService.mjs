import { BasicService } from '../foundation/basicService.mjs';

/**
 * X (Twitter) Authentication Service
 * Provides utilities for managing X platform integration
 */

import { TwitterApi } from 'twitter-api-v2';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { encrypt, decrypt } from '../utils/encryption.mjs';

class XService extends BasicService {
  requiredServices = [
    'databaseService',
    'configService',
  ];
  constructor() {
    super();  
  }

  async isXAuthorized (avatarId) {
    const db = this.databaseService.getDatabase();
    const auth = await db.collection('x_auth').findOne({
      avatarId,
    });
    if (!auth?.accessToken) return false;
    if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
      try {
        await this.refreshAccessToken(auth);
        return true;
      } catch (error) {
        this.logger?.error?.('Token refresh failed:', error.message, { avatarId });
        if (error.code === 401 || error.message?.includes('invalid_grant')) {
          await db.collection('x_auth').deleteOne({ avatarId });
        }
        return false;
      }
    }
    return new Date() < new Date(auth.expiresAt);
  };

  // --- Client-side methods (for browser, can be static or moved elsewhere if needed) ---
  async checkXAuthStatus(avatarId) {
    try {
      const response = await fetch(`/api/xauth/status/${avatarId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check X authentication status');
      }
      return await response.json();
    } catch (error) {
      this.logger?.error?.('X auth status check error:', error);
      return {
        authorized: false,
        error: error.message,
        requiresReauth: true
      };
    }
  }

  async initiateXAuth(avatarId) {
    try {
      const response = await fetch(`/api/xauth/auth-url?avatarId=${avatarId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (!data.url) {
        throw new Error('No authentication URL returned from server');
      }
      // Open X authentication in a popup window
      const width = 600;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        data.url,
        'xauth_popup',
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
      return { success: true, message: 'X authentication initiated' };
    } catch (error) {
      this.logger?.error?.('X auth initiation error:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnectXAuth(avatarId) {
    try {
      const response = await fetch(`/api/xauth/disconnect/${avatarId}`, {
        method: 'POST'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logger?.error?.('X auth disconnect error:', error);
      return { success: false, error: error.message };
    }
  }

  async connectWalletToXAuth(avatarId, walletAddress, signature, message) {
    try {
      const response = await fetch('/api/xauth/connect-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId, walletAddress, signature, message })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logger?.error?.('Connect wallet to X auth error:', error);
      return { success: false, error: error.message };
    }
  }

  // --- Server-side methods ---
  async refreshAccessToken(auth) {
    const db = this.databaseService.getDatabase();
    const client = new TwitterApi({
      clientId: this.configService.get('X_CLIENT_ID') || process.env.X_CLIENT_ID,
      clientSecret: this.configService.get('X_CLIENT_SECRET') || process.env.X_CLIENT_SECRET,
    });
    try {
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = await client.refreshOAuth2Token(auth.refreshToken);
      const expiresAt = new Date(Date.now() + ((expiresIn || 7200) * 1000));
      await db.collection('x_auth').updateOne(
        { avatarId: auth.avatarId },
        {
          $set: {
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt,
            updatedAt: new Date(),
          },
        }
      );
      return { accessToken, expiresAt };
    } catch (error) {
      this.logger?.error?.('Token refresh failed:', error.message, { avatarId: auth.avatarId });
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
      }
      throw new Error('Failed to refresh token');
    }
  }

  verifyWalletSignature(message, signature, walletAddress) {
    try {
      const messageBytes = new TextEncoder().encode(message);
      const publicKey = bs58.decode(walletAddress);
      const signatureBytes = Buffer.from(signature, 'hex');
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
      this.logger?.info?.('Signature verification result:', isValid, { walletAddress });
      return isValid;
    } catch (err) {
      this.logger?.error?.('Signature verification failed:', err.message, { walletAddress });
      return false;
    }
  }

  async isXAuthorized(avatarId) {
    const db = this.databaseService.getDatabase();
    const auth = await db.collection('x_auth').findOne({ avatarId });
    if (!auth?.accessToken) return false;
    if (new Date() >= new Date(auth.expiresAt) && auth.refreshToken) {
      try { await this.refreshAccessToken(auth); return true; } catch { return false; }
    }
    return new Date() < new Date(auth.expiresAt);
  }

  async postImageToX(avatar, imageUrl, content) {
    const db = this.databaseService.getDatabase();
    const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
    if (!auth?.accessToken) return '-# [ ❌ Error: X authorization required. Please connect your account. ]';
    const twitterClient = new TwitterApi(decrypt(auth.accessToken));
    const v2Client = twitterClient.v2;
    const tweetContent = `${content} ${imageUrl}`.trim().slice(0, 280);
    const result = await v2Client.tweet(tweetContent);
    if (!result) return '-# [ ❌ Failed to post image to X. ]';
    const tweetId = result.data.id;
    const tweetUrl = `https://x.com/ratimics/status/${tweetId}`;
    await db.collection('social_posts').insertOne({ avatarId: avatar._id, content: tweetContent, imageUrl, timestamp: new Date(), postedToX: true, tweetId });
    return `-# ✨ [ [Posted image to X](${tweetUrl}) ]`;
  }

  async getXTimelineAndNotifications(avatar) {
    const db = this.databaseService.getDatabase();
    const auth = await db.collection('x_auth').findOne({ avatarId: avatar._id.toString() });
    if (!auth) return { timeline: [], notifications: [], userId: null };
    const twitterClient = new TwitterApi(decrypt(auth.accessToken));
    const v2Client = twitterClient.v2;
    const userData = await v2Client.me();
    const userId = userData.data.id;
    const timelineResp = await v2Client.homeTimeline({ max_results: 30 });
    const notificationsResp = await v2Client.userMentionTimeline(userId, { max_results: 10 });
    const timeline = timelineResp?.data?.data?.map(t => ({ id: t.id, text: t.text, user: t.author_id, isOwn: t.author_id === userId })) || [];
    const notifications = notificationsResp?.data?.data?.map(n => ({ id: n.id, text: n.text, user: n.author_id, isOwn: n.author_id === userId })) || [];
    // Save all tweets to DB
    const allTweets = [...timeline, ...notifications];
    for (const tweet of allTweets) {
      if (!tweet?.id) continue;
      await db.collection('social_posts').updateOne(
        { tweetId: tweet.id },
        { $set: { tweetId: tweet.id, content: tweet.text, userId: tweet.user, isOwn: tweet.isOwn, avatarId: avatar._id, timestamp: new Date(), postedToX: tweet.isOwn } },
        { upsert: true }
      );
    }
    return { timeline, notifications, userId };
  }
}

export { XService };
export default XService;