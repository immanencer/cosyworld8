
import { Router } from 'express';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenBurnService } from '../../src/services/tokenBurnService.mjs';
import { NFTMintingService } from '../../src/services/nftMintService.mjs';

const router = Router();
let nftMintService;

// Your existing routes here
router.post('/burn', async (req, res) => {
  // Implementation
});

router.post('/mint', async (req, res) => {
  // Implementation
});

export default function(db) {
  nftMintService = new NFTMintingService(db);
  return router;
}
