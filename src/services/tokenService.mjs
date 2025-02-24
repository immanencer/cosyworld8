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
    // Set RPC URL (Devnet by default)
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

    // Initialize Moonshot SDK instance
    this.moonshot = new Moonshot({
      rpcUrl: this.rpcUrl,
      environment: Environment.DEVNET,
      chainOptions: {
        solana: { confirmOptions: { commitment: 'confirmed' } },
      },
    });

    // Load the main wallet (creator) from the environment variable
    this.serverWallet = this.loadServerWallet();
  }

  loadServerWallet() {
    const base58SecretKey = process.env.SERVER_SECRET_KEY;
    if (!base58SecretKey) {
      throw new Error('SERVER_SECRET_KEY environment variable is not set');
    }
    let secretKey;
    try {
      secretKey = bs58.decode(base58SecretKey);
    } catch (error) {
      throw new Error('Invalid SERVER_SECRET_KEY format. Ensure it is a valid Base58 string.');
    }
    return Keypair.fromSecretKey(secretKey);
  }

  /**
   * Creates a new token mint using Moonshot.
   * @param {object} params
   * @param {string} params.name - The name of the token.
   * @param {string} params.symbol - The symbol for the token (max 4 characters, uppercase).
   * @param {string} params.description - A description for the token.
   * @param {string} params.iconPath - Icon image in base64.
   * @param {string} params.bannerPath - baerer image in base64.
   * @returns {Promise<object>} The response from the mint transaction.
   */
  async createToken({ name, symbol, description, icon, banner }) {
    try {
      console.log('Token creation request:', { name, symbol, description, icon, banner });

      // Ensure all required parameters are provided
      if (!name || !symbol || !description || !icon || !banner) {
        console.error('Missing required token parameters');
        throw new Error('Missing required token parameters');
      }

      // Enforce a maximum 4-character symbol in uppercase
      if (symbol.length > 4) {
        symbol = symbol.substring(0, 4).toUpperCase();
      }


      const creator = this.serverWallet;
      console.log('Creator:', creator.publicKey.toBase58());

      // Prepare the mint transaction using the Moonshot SDK
      const prepMint = await this.moonshot.prepareMintTx({
        creator: creator.publicKey.toBase58(),
        name,
        symbol,
        curveType: CurveType.CONSTANT_PRODUCT_V1,
        migrationDex: MigrationDex.RAYDIUM,
        icon,
        description,
        links: [{ url: 'https://www.moonstone-sanctum.com', label: 'Website' }],
        banner,
        tokenAmount: '42000000000', // Initial token amount to buy
      });

      // Deserialize the transaction from the response
      const deserializedTransaction = SolanaSerializationService.deserializeVersionedTransaction(
        prepMint.transaction
      );
      if (!deserializedTransaction) {
        throw new Error('Failed to deserialize transaction');
      }

      // Sign the transaction with the creator's wallet
      deserializedTransaction.sign([creator]);

      // Serialize the signed transaction
      const signedTransaction = SolanaSerializationService.serializeVersionedTransaction(
        deserializedTransaction
      );

      // Submit the mint transaction
      const res = await this.moonshot.submitMintTx({
        tokenId: prepMint.tokenId,
        token: prepMint.token,
        signedTransaction,
      });

      console.log('Mint response:', res);
      return res;
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }
}
