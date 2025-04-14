import express from 'express';
import { ObjectId } from 'mongodb';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const router = express.Router();

export default function(db) {
  if (!db) {
    console.error('Database connection not provided to claims route');
    throw new Error('Database not connected');
  }

  // **Utility Functions**

  /**
   * Verifies a signature for a claim using Solana's verification method
   * @param {string} message - The message that was signed
   * @param {string} signatureHex - The signature in hex format
   * @param {string} walletAddress - The Solana wallet address (base58 encoded)
   * @returns {Promise<boolean>} - Whether the signature is valid
   */
  const verifySignature = async (message, signatureHex, walletAddress) => {
    try {
      const signatureBytes = Buffer.from(signatureHex, 'hex');
      const messageBytes = new TextEncoder().encode(message);
      const publicKey = bs58.decode(walletAddress);
      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  };

  /**
   * Checks claim allowance for a wallet
   * @param {string} walletAddress - The wallet address to check
   * @returns {Promise<{allowed: boolean, remaining: number, current: number}>} - Claim allowance details
   */
  const checkClaimAllowance = async (walletAddress) => {
    const existingClaims = await db.collection('avatar_claims').countDocuments({
      walletAddress: walletAddress.toLowerCase()
    });
    const MAX_CLAIMS_PER_WALLET = parseInt(process.env.MAX_CLAIMS_PER_WALLET || '3');
    return {
      allowed: existingClaims < MAX_CLAIMS_PER_WALLET,
      remaining: Math.max(0, MAX_CLAIMS_PER_WALLET - existingClaims),
      current: existingClaims
    };
  };

  // **Routes**

  // Check claim status for an avatar
  router.get('/status/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      let objectId;
      try {
        objectId = new ObjectId(avatarId);
      } catch {
        return res.status(400).json({ error: 'Invalid avatar ID format' });
      }

      const avatar = await db.collection('avatars').findOne({ _id: objectId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const claim = await db.collection('avatar_claims').findOne({ avatarId: objectId });
      if (claim) {
        return res.json({
          claimed: claim.status === 'pending' || claim.status === 'claimed' ||  claim.status === 'minted',
          claimedBy: claim.walletAddress,
          claimedAt: claim.updatedAt,
          minted: claim.status === 'minted'
        });
      }
      return res.json({ claimed: false });
    } catch (error) {
      console.error('Claim status check error:', error);
      res.status(500).json({
        error: 'Failed to check claim status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Get all claims for a user
  router.get('/user/:walletAddress', async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const claims = await db.collection('avatar_claims')
        .find({ walletAddress: walletAddress.toLowerCase() })
        .toArray();

      const avatarIds = claims.map(claim => new ObjectId(claim.avatarId));
      const avatars = avatarIds.length > 0
        ? await db.collection('avatars').find({ _id: { $in: avatarIds } }).toArray()
        : [];

      const claimedAvatars = claims.map(claim => ({
        claim,
        avatar: avatars.find(a => a._id.toString() === claim.avatarId.toString()) || null
      }));

      const allowance = await checkClaimAllowance(walletAddress);
      res.json({ claims: claimedAvatars, allowance });
    } catch (error) {
      console.error('User claims fetch error:', error);
      res.status(500).json({
        error: 'Failed to fetch user claims',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Claim an avatar
  router.post('/claim', async (req, res) => {
    try {
      const { avatarId, walletAddress, signature, message } = req.body;
      if (!avatarId || !walletAddress || !signature || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let objectId;
      try {
        objectId = new ObjectId(avatarId);
      } catch {
        return res.status(400).json({ error: 'Invalid avatar ID format' });
      }

      const avatar = await db.collection('avatars').findOne({ _id: objectId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const existingClaim = await db.collection('avatar_claims').findOne({ avatarId: objectId });
      if (existingClaim) {
        return res.status(409).json({
          error: 'Avatar already claimed',
          claimedBy: existingClaim.walletAddress
        });
      }

      const isValidSignature = await verifySignature(message, signature, walletAddress);
      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const allowance = await checkClaimAllowance(walletAddress);
      if (!allowance.allowed) {
        return res.status(403).json({ error: 'Claim limit reached', allowance });
      }

      const now = new Date();
      const claim = {
        avatarId: objectId,
        walletAddress: walletAddress,
        signature,
        message,
        createdAt: now,
        updatedAt: now,
        status: 'pending'
      };

      await db.collection('avatar_claims').insertOne(claim);
      await db.collection('avatars').updateOne(
        { _id: objectId },
        {
          $set: {
            claimed: true,
            claimedBy: walletAddress.toLowerCase(),
            claimedAt: now
          }
        }
      );

      const updatedAllowance = await checkClaimAllowance(walletAddress);
      res.status(201).json({
        success: true,
        claim: {
          avatarId,
          walletAddress: walletAddress.toLowerCase(),
          status: 'pending',
          createdAt: now
        },
        allowance: updatedAllowance
      });
    } catch (error) {
      console.error('Claim creation error:', error);
      res.status(500).json({
        error: 'Failed to process claim',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Mint a claimed avatar (admin only)
  router.post('/mint/:claimId', async (req, res) => {
    try {
      const { claimId } = req.params;
      const { adminKey } = req.body;

      if (adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      let objectId;
      try {
        objectId = new ObjectId(claimId);
      } catch {
        return res.status(400).json({ error: 'Invalid claim ID format' });
      }

      const claim = await db.collection('avatar_claims').findOne({ _id: objectId });
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }

      const avatar = await db.collection('avatars').findOne({ _id: claim.avatarId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Simulate minting (replace with actual minting logic in production)
      await db.collection('avatar_claims').updateOne(
        { _id: objectId },
        {
          $set: {
            status: 'minted',
            mintedAt: new Date(),
            mintTxId: `simulated-tx-${Date.now()}`
          }
        }
      );

      res.json({
        success: true,
        status: 'minted',
        avatar: { id: avatar._id, name: avatar.name }
      });
    } catch (error) {
      console.error('Minting error:', error);
      res.status(500).json({
        error: 'Failed to process minting',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  return router;
}