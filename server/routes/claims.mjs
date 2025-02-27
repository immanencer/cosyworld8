import express from 'express';
import { ObjectId } from 'mongodb';
import { ethers } from 'ethers';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const router = express.Router();

export default function(db) {
  if (!db) {
    console.error('Database connection not provided to claims route');
    throw new Error('Database not connected');
  }

  // Verify a signature to validate claim
  const verifySignature = async (message, signatureHex, walletAddress) => {
    try {
      // Convert hex signature back to Uint8Array
      const signatureBytes = Buffer.from(signatureHex, 'hex');
      
      // Convert message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);
      
      // For Solana addresses, which are base58 encoded
      const publicKey = bs58.decode(walletAddress);
      
      // Verify signature using tweetnacl
      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  };

  // Check if wallet has enough claims allowance
  const checkClaimAllowance = async (walletAddress) => {
    // Get existing claims count for this wallet
    const existingClaims = await db.collection('avatar_claims').countDocuments({ 
      walletAddress: walletAddress.toLowerCase() 
    });
    
    // For now, set a fixed limit of 3 claims per wallet
    const MAX_CLAIMS_PER_WALLET = 3;
    
    return {
      allowed: existingClaims < MAX_CLAIMS_PER_WALLET,
      remaining: Math.max(0, MAX_CLAIMS_PER_WALLET - existingClaims),
      current: existingClaims
    };
  };

  // Check claim status
  router.get('/status/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      let objectId;
      
      try {
        objectId = new ObjectId(avatarId);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid avatar ID format' });
      }
      
      // Check if avatar exists
      const avatar = await db.collection('avatars').findOne({ _id: objectId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      // Check if avatar is already claimed
      const claim = await db.collection('avatar_claims').findOne({ avatarId: objectId });
      
      if (claim) {
        return res.json({
          claimed: true,
          claimedBy: claim.walletAddress,
          claimedAt: claim.updatedAt
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

  // Get all user claims
  router.get('/user/:walletAddress', async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      // Get user's claims
      const claims = await db.collection('avatar_claims')
        .find({ walletAddress: walletAddress.toLowerCase() })
        .toArray();
      
      // Get avatars for these claims
      const avatarIds = claims.map(claim => new ObjectId(claim.avatarId));
      const avatars = avatarIds.length > 0 
        ? await db.collection('avatars')
            .find({ _id: { $in: avatarIds } })
            .toArray()
        : [];
      
      // Merge data
      const claimedAvatars = claims.map(claim => {
        const avatar = avatars.find(a => a._id.toString() === claim.avatarId.toString());
        return {
          claim,
          avatar: avatar || null
        };
      });
      
      // Get allowance info
      const allowance = await checkClaimAllowance(walletAddress);
      
      res.json({
        claims: claimedAvatars,
        allowance
      });
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
      } catch (error) {
        return res.status(400).json({ error: 'Invalid avatar ID format' });
      }
      
      // Check if avatar exists
      const avatar = await db.collection('avatars').findOne({ _id: objectId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      // Check if avatar is already claimed
      const existingClaim = await db.collection('avatar_claims').findOne({ avatarId: objectId });
      if (existingClaim) {
        return res.status(409).json({ error: 'Avatar already claimed' });
      }
      
      // Verify signature
      const isValidSignature = await verifySignature(message, signature, walletAddress);
      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      // Check claim allowance
      const allowance = await checkClaimAllowance(walletAddress);
      if (!allowance.allowed) {
        return res.status(403).json({ 
          error: 'Claim limit reached',
          allowance
        });
      }
      
      // Create claim record
      const now = new Date();
      const claim = {
        avatarId: objectId,
        walletAddress: walletAddress.toLowerCase(),
        signature,
        message,
        createdAt: now,
        updatedAt: now,
        status: 'pending' // pending, minted, failed
      };
      
      await db.collection('avatar_claims').insertOne(claim);
      
      // Update avatar record
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
      
      // Return updated allowance info
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

  // Mint to Crossmint (admin only)
  router.post('/mint/:claimId', async (req, res) => {
    try {
      // In a production app, you would add admin authentication here
      const { claimId } = req.params;
      const { adminKey } = req.body;
      
      // Simple admin verification (replace with proper auth in production)
      if (adminKey !== process.env.ADMIN_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      let objectId;
      try {
        objectId = new ObjectId(claimId);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid claim ID format' });
      }
      
      // Get the claim
      const claim = await db.collection('avatar_claims').findOne({ _id: objectId });
      if (!claim) {
        return res.status(404).json({ error: 'Claim not found' });
      }
      
      // Get the avatar
      const avatar = await db.collection('avatars').findOne({ _id: claim.avatarId });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }
      
      // In a real implementation, initiate the Crossmint API call here
      // For this example, we'll just simulate success
      
      // Update claim status
      await db.collection('avatar_claims').updateOne(
        { _id: objectId },
        { 
          $set: { 
            status: 'minted',
            mintedAt: new Date(),
            mintTxId: 'simulated-tx-' + Date.now()
          }
        }
      );
      
      res.json({
        success: true,
        status: 'minted',
        avatar: {
          id: avatar._id,
          name: avatar.name
        }
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
