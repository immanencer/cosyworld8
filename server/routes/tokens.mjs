
import { Router } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenBurnService } from '../../src/services/tokenBurnService.mjs';
import { NFTMintService } from '../../src/services/nftMintService.mjs';

const router = Router();
const connection = new Connection(process.env.SOLANA_RPC_URL);
const tokenBurnService = new TokenBurnService(connection);
const nftMintService = new NFTMintService(connection);

router.post('/burn', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const transaction = await tokenBurnService.burnTokens(walletAddress);
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/burn/confirm', async (req, res) => {
  try {
    const { signature, walletAddress } = req.body;
    const verified = await tokenBurnService.verifyBurnTransaction(signature);
    
    if (verified) {
      const nft = await nftMintService.mintNFT(walletAddress, signature);
      res.json({ success: true, nft });
    } else {
      res.status(400).json({ error: 'Invalid burn transaction' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
