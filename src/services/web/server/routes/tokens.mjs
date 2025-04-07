
import express from 'express';
import { TokenService } from '../../../blockchain/tokenService.mjs';
import { ObjectId } from 'mongodb';
import { processImage } from '../../../utils/processImage.mjs';
import { PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import nacl from 'tweetnacl';

export default function tokenRoutes(db) {
  const router = express.Router();
  const tokenService = new TokenService();

  router.get('/check/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const existingToken = await db.collection('avatar_tokens').findOne({
        avatarId: new ObjectId(avatarId)
      });
      res.json({ exists: !!existingToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/metadata/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { walletAddress } = req.body;

      const avatar = await db.collection('avatars').findOne({
        _id: new ObjectId(avatarId),
        claimed: true
      });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found or not claimed' });
      }

      const existingToken = await db.collection('avatar_tokens').findOne({
        avatarId: new ObjectId(avatarId)
      });

      if (existingToken) {
        return res.status(400).json({ error: 'Token already exists for this avatar' });
      }

      const icon = await processImage(avatar.imageUrl, 512, 512);
      const banner = await processImage(avatar.imageUrl, 512, 256);

      const tokenMetadata = {
        name: avatar.name,
        symbol: avatar.name.substring(0, 4).toUpperCase(),
        description: `Token for ${avatar.name} from Monstone Sanctum`,
        icon,
        banner
      };

      res.json({
        success: true,
        ...tokenMetadata
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/record/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { tokenId, mint } = req.body;

      await db.collection('avatar_tokens').insertOne({
        avatarId: new ObjectId(avatarId),
        tokenId,
        mint,
        status: 'completed',
        createdAt: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/link/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { tokenMint, signature, message, publicKey } = req.body;

      if (!tokenMint || !signature || !message || !publicKey) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Verify the signature
      const encodedMessage = new TextEncoder().encode(message);
      const signatureUint8 = bs58.decode(signature);
      const publicKeyUint8 = new PublicKey(publicKey).toBytes();
      
      const isValid = nacl.sign.detached.verify(
        encodedMessage,
        signatureUint8,
        publicKeyUint8
      );

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const avatar = await db.collection('avatars').findOne({ 
        _id: new ObjectId(avatarId) 
      });
      
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const result = await tokenService.linkExistingToken(tokenMint, new ObjectId(avatarId), db);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
