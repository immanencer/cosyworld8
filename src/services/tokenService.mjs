
import {
  CurveType,
  Environment,
  MigrationDex,
  Moonshot,
  SolanaSerializationService
} from '@wen-moon-ser/moonshot-sdk';

export class TokenService {
  constructor(connection) {
    this.connection = connection;
    this.moonshot = new Moonshot({
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      environment: Environment.DEVNET,
      chainOptions: {
        solana: { confirmOptions: { commitment: 'confirmed' } },
      },
    });
  }

  async createToken({ name, symbol, description, imageUrl, walletAddress }) {
    try {
      console.log('Token creation request:', { name, symbol, description, imageUrl, walletAddress });

      if (!name || !symbol || !description || !imageUrl || !walletAddress) {
        console.error('Missing parameters:', { name, symbol, description, imageUrl, walletAddress });
        throw new Error('Missing required token parameters');
      }

      if (symbol.length > 4) {
        symbol = symbol.substring(0, 4).toUpperCase();
      }

      try {
        const prepMint = await this.moonshot.prepareMintTx({
          creator: walletAddress,
          name,
          symbol,
          curveType: CurveType.CONSTANT_PRODUCT_V1,
          migrationDex: MigrationDex.RAYDIUM,
          icon: imageUrl,
          description,
          links: [{ url: 'https://moonstonesanctum.io', label: 'Website' }],
          banner: imageUrl,
          tokenAmount: '1000000000',
          chainId: 'solanadevnet',
          marketEnabled: true,
          decimals: 9,
          maxSupply: '1000000000000'
        });

        if (!prepMint || !prepMint.transaction) {
          console.error('Invalid response from prepareMintTx:', prepMint);
          throw new Error('Failed to prepare mint transaction');
        }

        return {
          success: true,
          tokenId: prepMint.tokenId || Date.now().toString(),
          token: prepMint.token,
          unsignedTx: prepMint.transaction
        };
      } catch (error) {
        console.error('Error in prepareMintTx:', error);
        throw new Error(`Failed to prepare mint transaction: ${error.message}`);
      }

    } catch (error) {
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }
}
