
import express from 'express';
import { TokenService } from '../../src/services/tokenService.mjs';
import { Connection } from '@solana/web3.js';

const router = express.Router();

export default function tokenRoutes(db) {
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const tokenService = new TokenService(connection);

  // Create new token for avatar
  router.post('/create/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { walletAddress, devBuyAmount } = req.body;

      const avatar = await db.collection('avatars').findOne({ _id: new ObjectId(avatarId) });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const result = await tokenService.createToken({
        name: avatar.name,
        symbol: avatar.name.substring(0, 4).toUpperCase(),
        description: `Token for ${avatar.name} from Moonstone Sanctum`,
        imageUrl: avatar.imageUrl
      }, walletAddress, devBuyAmount);

      await db.collection('avatar_tokens').insertOne({
        avatarId: new ObjectId(avatarId),
        tokenMint: result.mint,
        createdAt: new Date(),
        type: 'created',
        signature: result.signature
      });

      res.json(result);
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
