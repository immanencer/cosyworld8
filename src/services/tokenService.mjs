
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export class TokenService {
  constructor(connection) {
    this.connection = connection;
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
