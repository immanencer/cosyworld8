/**
 * X (Twitter) Authentication Service
 * Provides utilities for managing X platform integration
 */

import { TwitterApi } from 'twitter-api-v2';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Check X authentication status
export async function checkXAuthStatus(avatarId) {
  try {
    const response = await fetch(`/api/xauth/status/${avatarId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to check X authentication status');
    }
    return await response.json();
  } catch (error) {
    console.error('X auth status check error:', error);
    return {
      authorized: false,
      error: error.message,
      requiresReauth: true
    };
  }
}

// Initiate X authentication
export async function initiateXAuth(avatarId) {
  try {
    // Simple request without requiring wallet signature for initial URL generation
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
    console.error('X auth initiation error:', error);
    return { success: false, error: error.message };
  }
}

// Disconnect X authentication
export async function disconnectXAuth(avatarId) {
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
    console.error('X auth disconnect error:', error);
    return { success: false, error: error.message };
  }
}

// Connect wallet to X auth after authentication is complete
export async function connectWalletToXAuth(avatarId, walletAddress, signature, message) {
  try {
    const response = await fetch('/api/xauth/connect-wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        avatarId,
        walletAddress,
        signature,
        message
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Connect wallet to X auth error:', error);
    return { success: false, error: error.message };
  }
}

export async function refreshAccessToken(db, auth) {
  const client = new TwitterApi({
    clientId: process.env.X_CLIENT_ID,
    clientSecret: process.env.X_CLIENT_SECRET,
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
    console.error('Token refresh failed:', error.message, { avatarId: auth.avatarId });
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      await db.collection('x_auth').deleteOne({ avatarId: auth.avatarId });
    }
    throw new Error('Failed to refresh token');
  }
}

export function verifyWalletSignature(message, signature, walletAddress) {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const publicKey = bs58.decode(walletAddress);
    const signatureBytes = Buffer.from(signature, 'hex');
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
    console.log('Signature verification result:', isValid, { walletAddress });
    return isValid;
  } catch (err) {
    console.error('Signature verification failed:', err.message, { walletAddress });
    return false;
  }
}

export default {
  checkXAuthStatus,
  initiateXAuth,
  disconnectXAuth,
  connectWalletToXAuth,
  refreshAccessToken,
  verifyWalletSignature
};