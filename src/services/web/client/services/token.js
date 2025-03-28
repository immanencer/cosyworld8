
import { Moonshot, CurveType, MigrationDex, SolanaSerializationService } from "@wen-moon-ser/moonshot-sdk";
import { Buffer } from 'buffer';

export const createToken = async (avatarId, walletAddress) => {
  const moonshot = new Moonshot({
    rpcUrl: "https://api.devnet.solana.com",
    environment: "devnet",
    chainOptions: {
      solana: { confirmOptions: { commitment: "confirmed" } },
    },
  });

  const tokenMetadata = await fetchJSON(`/api/tokens/metadata/${avatarId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  });

  const prepMint = await moonshot.prepareMintTx({
    creator: walletAddress,
    name: tokenMetadata.name,
    symbol: tokenMetadata.symbol,
    description: tokenMetadata.description,
    icon: tokenMetadata.icon,
    banner: tokenMetadata.banner,
    curveType: CurveType.CONSTANT_PRODUCT_V1,
    migrationDex: MigrationDex.RAYDIUM,
    tokenAmount: "42000000000",
  });

  return prepMint;
};
