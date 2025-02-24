import {
  CurveType,
  Environment,
  MigrationDex,
  Moonshot,
  SolanaSerializationService,
} from '@wen-moon-ser/moonshot-sdk';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

export class TokenService {
  constructor() {
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.moonshot = new Moonshot({
      rpcUrl: this.rpcUrl,
      environment: Environment.DEVNET,
      chainOptions: {
        solana: { confirmOptions: { commitment: 'confirmed' } },
      },
    });
  }

  async createToken({ name, symbol, description, icon, banner }) {
    try {
      console.log('Token creation request:', { name, symbol, description });

      if (!name || !symbol || !description || !icon || !banner) {
        throw new Error('Missing required token parameters');
      }

      if (symbol.length > 4) {
        symbol = symbol.substring(0, 4).toUpperCase();
      }

      const prepMint = await this.moonshot.prepareMintTx({
        name,
        symbol,
        curveType: CurveType.CONSTANT_PRODUCT_V1,
        migrationDex: MigrationDex.RAYDIUM,
        icon,
        description,
        links: [{ url: 'https://www.moonstone-sanctum.com', label: 'Website' }],
        banner,
        tokenAmount: '42000000000',
      });

      console.log('Mint preparation:', prepMint);
      return prepMint;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }

  async submitSignedTransaction(signedTx, tokenId) {
    try {
      const res = await this.moonshot.submitMintTx({
        tokenId,
        signedTransaction: signedTx
      });
      return res;
    } catch (error) {
      throw new Error(`Failed to submit signed transaction: ${error.message}`);
    }
  }
}