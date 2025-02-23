import { 
  CurveType, 
  Environment, 
  MigrationDex,
  Moonshot
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

  async createToken({ name, symbol, description, imageUrl }, walletAddress) {
    try {
      if (!name || !symbol || !description || !imageUrl || !walletAddress) {
        throw new Error('Missing required token parameters');
      }

      if (symbol.length > 4) {
        symbol = symbol.substring(0, 4).toUpperCase();
      }

      // Create unsigned transaction using Moonshot SDK 
      const prepMint = await this.moonshot.prepareMintTx({
        creator: walletAddress,
        name,
        symbol,
        curveType: CurveType.CONSTANT_PRODUCT_V1,
        migrationDex: MigrationDex.RAYDIUM,
        icon: imageUrl,
        description,
        links: [{url: 'https://moonstonesanctum.io', label: 'Website'}],
        banner: imageUrl,
        tokenAmount: '1000000000000' // 1 billion with 9 decimals
      });

      return {
        success: true,
        tokenId: prepMint.tokenId,
        token: prepMint.token,
        unsignedTx: prepMint.transaction
      };

    } catch (error) {
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }
}
