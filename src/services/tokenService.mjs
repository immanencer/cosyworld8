
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export class TokenService {
  constructor(connection) {
    this.connection = connection;
    this.apiBaseUrl = 'https://pumpportal.fun/api';
  }

  async createWallet() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/create-wallet`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Wallet creation failed: ${error.message}`);
    }
  }

  async createUserWallet(userId, db) {
    try {
      const wallet = await this.createWallet();
      
      // Store wallet info in database
      await db.collection('user_wallets').insertOne({
        userId,
        walletData: wallet,
        createdAt: new Date()
      });

      return wallet;
    } catch (error) {
      throw new Error(`User wallet creation failed: ${error.message}`);
    }
  }

  async createToken(metadata, walletAddress, devBuyAmount = 1) {
    const mintKeypair = Keypair.generate();
    
    // Create form data for metadata
    const formData = new FormData();
    formData.append("file", metadata.imageUrl);
    formData.append("name", metadata.name);
    formData.append("symbol", metadata.symbol);
    formData.append("description", metadata.description);
    formData.append("twitter", metadata.twitter || "");
    formData.append("telegram", metadata.telegram || "");
    formData.append("website", metadata.website || "");
    formData.append("showName", "true");

    // Upload to IPFS
    const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: formData,
    });
    const metadataResponseJSON = await metadataResponse.json();

    // Create token
    const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${process.env.PUMP_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        tokenMetadata: {
          name: metadataResponseJSON.metadata.name,
          symbol: metadataResponseJSON.metadata.symbol,
          uri: metadataResponseJSON.metadataUri
        },
        mint: bs58.encode(mintKeypair.secretKey),
        denominatedInSol: "true",
        amount: devBuyAmount,
        slippage: 10,
        priorityFee: 0.0005,
        pool: "pump"
      })
    });

    if (response.status === 200) {
      const data = await response.json();
      return {
        success: true,
        signature: data.signature,
        mint: mintKeypair.publicKey.toString()
      };
    }
    
    throw new Error(await response.text());
  }

  async linkExistingToken(tokenMint, avatarId, db) {
    try {
      // Verify the token exists
      const mintInfo = await this.connection.getParsedAccountInfo(new PublicKey(tokenMint));
      if (!mintInfo.value) {
        throw new Error('Token mint not found');
      }

      // Store the token association
      await db.collection('avatar_tokens').insertOne({
        avatarId,
        tokenMint,
        linkedAt: new Date(),
        type: 'linked'
      });

      return {
        success: true,
        tokenMint
      };
    } catch (error) {
      throw new Error(`Failed to link token: ${error.message}`);
    }
  }
}
import { 
  CurveType, 
  Environment, 
  MigrationDex,
  Moonshot,
  SolanaSerializationService
} from '@wen-moon-ser/moonshot-sdk';
import { Connection, Keypair } from '@solana/web3.js';

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
