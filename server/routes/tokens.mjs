
import { Router } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenBurnService } from '../../src/services/tokenBurnService.mjs';
import { NFTMintingService } from '../../src/services/nftMintService.mjs';

const router = Router();
let tokenBurnService;
let nftMintService;

if (process.env.SOLANA_RPC_URL) {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    tokenBurnService = new TokenBurnService(connection);
    nftMintService = new NFTMintingService(connection);
  } catch (error) {
    console.error('Error initializing token services:', error);
  }
}

  router.post('/burn', async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address is required' });
      }
      const transaction = await tokenBurnService.burnTokens(walletAddress);
      res.json({ transaction });
    } catch (error) {
      console.error('Error in burn endpoint:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  router.post('/burn/confirm', async (req, res) => {
    try {
      const { signature, walletAddress } = req.body;
      if (!signature || !walletAddress) {
        return res.status(400).json({ error: 'Signature and wallet address are required' });
      }

      const verified = await tokenBurnService.verifyBurnTransaction(signature);
      
      if (verified) {
        const nft = await nftMintService.mintNFT(walletAddress, signature);
        res.json({ success: true, nft });
      } else {
        res.status(400).json({ error: 'Invalid burn transaction' });
      }
    } catch (error) {
      console.error('Error in burn/confirm endpoint:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });
} catch (error) {
  console.error('Error initializing token services:', error);
  // Add error middleware
  router.use((req, res) => {
    res.status(500).json({ error: 'Token services unavailable' });
  });
}

export default router;
