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

  async createToken({ name, symbol, description, icon, banner, walletAddress }) {
    try {
      console.log('Token creation request:', { name, symbol, description });

      // Validate required parameters
      if (!name || !symbol || !description || !icon || !banner || !walletAddress) {
        throw new Error('Missing required token parameters');
      }

      // Normalize symbol
      symbol = symbol.substring(0, 4).toUpperCase();

      // Validate token parameters
      if (name.length < 3) {
        throw new Error('Token name must be at least 3 characters long');
      }
      if (symbol.length < 2) {
        throw new Error('Token symbol must be at least 2 characters long');
      }

      // Prepare mint params
      const mintParams = {
        creator: walletAddress,
        name,
        symbol,
        curveType: CurveType.CONSTANT_PRODUCT_V1,
        migrationDex: MigrationDex.RAYDIUM,
        icon,
        description,
        links: [{ url: 'https://www.moonstone-sanctum.com', label: 'Website' }],
        banner,
        tokenAmount: '42000000000',
      };

      console.log('Preparing mint with params:', mintParams);

      const prepMint = await this.moonshot.prepareMintTx(mintParams);
      
      if (!prepMint || !prepMint.tokenId) {
        throw new Error('Invalid response from Moonshot SDK');
      }

      console.log('Mint preparation successful:', {
        tokenId: prepMint.tokenId,
        name: prepMint.name,
        symbol: prepMint.symbol
      });

      return prepMint;
    } catch (error) {
      console.error('Error creating token:', {
        error: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.response) {
        console.error('API Response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
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