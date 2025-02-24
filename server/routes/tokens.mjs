import express from 'express';
import { TokenService } from '../../src/services/tokenService.mjs';
import { ObjectId } from 'mongodb';
import { processImage } from '../../src/services/utils/processImage.mjs';




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


  // Create new wallet for user
  router.post('/wallet', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const wallet = await tokenService.createUserWallet(userId, db);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create token for avatar
  router.post('/create/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { walletAddress } = req.body;

      console.log('Token creation request received:', {
        avatarId,
        walletAddress,
        body: req.body
      });

      if (!walletAddress) {
        console.error('Missing wallet address in request');
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      const avatar = await db.collection('avatars').findOne({
        _id: new ObjectId(avatarId),
        claimed: true
      });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found or not claimed' });
      }

      // Validate if token already exists
      const existingToken = await db.collection('avatar_tokens').findOne({
        avatarId: new ObjectId(avatarId)
      });

      if (existingToken) {
        return res.status(400).json({ error: 'Token already exists for this avatar' });
      }

      // Ensure walletAddress is properly passed
      if (!walletAddress) {
        console.error('Wallet address missing in token creation request');
        return res.status(400).json({ error: 'Wallet address is required' });
      }

      const icon = await processImage(avatar.imageUrl, 512, 512);
      const banner = await processImage(avatar.imageUrl, 512, 256);

      const tokenParams = {
        name: avatar.name,
        symbol: avatar.name.substring(0, 4).toUpperCase(),
        description: `Token for ${avatar.name} from Moonstone Sanctum`,
        icon, banner,
        walletAddress: walletAddress
      };

      console.log('Creating token with params:', tokenParams);
      const prepResult = await tokenService.createToken(tokenParams);

      // Client needs to sign the transaction and submit back
      res.json({
        success: true,
        tokenId: prepResult.tokenId,
        token: prepResult.token,
        unsignedTx: prepResult.unsignedTx
      });

      // Store token creation attempt
      // Store token creation attempt
      await db.collection('avatar_tokens').insertOne({
        avatarId: new ObjectId(avatarId),
        tokenId: prepResult.tokenId,
        status: 'pending',
        walletAddress,
        createdAt: new Date()
      });

      console.log('Token creation record stored:', prepResult);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Link existing token to avatar
  router.post('/link/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { tokenMint } = req.body;

      const avatar = await db.collection('avatars').findOne({ _id: new ObjectId(avatarId) });
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
