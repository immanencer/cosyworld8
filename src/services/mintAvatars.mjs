require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { Keypair, Connection, clusterApiUrl } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const fs = require('fs');

(async () => {
  // --- Configuration ---
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  const RPC_ENDPOINT = process.env.RPC_ENDPOINT || clusterApiUrl('mainnet-beta');
  const KEYPAIR_PATH = process.env.KEYPAIR_PATH;

  // Load Keypair
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8')));
  const keypair = Keypair.fromSecretKey(secretKey);

  // Setup Metaplex
  const connection = new Connection(RPC_ENDPOINT);
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage());

  // --- MongoDB Setup ---
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  // Fetch data (example: fetch a single avatar by ID)
  const avatarId = "6740093dcf0ed5ca9f3c1db4"; // Replace with the desired avatar _id
  const avatarsCol = db.collection('avatars');
  const narrativesCol = db.collection('narratives');
  const memoriesCol = db.collection('memories');

  const avatar = await avatarsCol.findOne({ _id: new ObjectId(avatarId) });
  if (!avatar) {
    console.error('Avatar not found!');
    process.exit(1);
  }

  // Fetch related narratives and memories
  const avatarObjectId = avatar._id.toString();
  const avatarNarratives = await narrativesCol.find({ avatarId: avatarObjectId }).toArray();
  const avatarMemories = await memoriesCol.find({ avatarId: new ObjectId(avatarObjectId) }).toArray();

  // Construct metadata for NFT
  // Basic metadata fields that usually go into an NFT json metadata (compatible with Metaplex)
  const nftMetadata = {
    name: avatar.name || "Unknown Character",
    symbol: "AVT", // Your collection symbol
    description: avatar.description || "An enigmatic character from the metaverse.",
    image: avatar.imageUrl || "https://placehold.co/600x600?text=No+Image", // Make sure it's a valid URI
    attributes: [
      { trait_type: "Emoji", value: avatar.emoji || "N/A" },
      { trait_type: "Personality", value: avatar.personality || "N/A" }
    ],
    // Additional fields representing dynamic personality, narratives, and memories
    properties: {
      category: "image",
      files: [
        {
          uri: avatar.imageUrl || "",
          type: "image/png" // or the correct MIME type for your image
        }
      ],
      creators: [
        {
          address: keypair.publicKey.toBase58(),
          share: 100
        }
      ],
      // Embed extended data: narratives, memories, dynamicPersonality etc.
      extra: {
        dynamicPersonality: avatar.dynamicPersonality || "",
        narratives: avatarNarratives.map(n => ({
          timestamp: n.timestamp,
          content: n.content
        })),
        memories: avatarMemories.map(m => ({
          timestamp: m.timestamp,
          memory: m.memory
        })),
        model: typeof avatar.model === "string" ? avatar.model : JSON.stringify(avatar.model || {})
      }
    }
  };

  // Upload metadata to Arweave or similar storage (via Bundlr)
  const { uri: metadataUri } = await metaplex.nfts().uploadMetadata(nftMetadata).run();

  console.log("Metadata uploaded to:", metadataUri);

  // Now create a compressed NFT. This requires a merkle tree and appropriate parameters.
  // For compressed NFTs, you typically need a tree pre-initialized. Let's assume you have:
  // - `treeAddress` = existing merkle tree PDA
  // - `collectionMintAddress` = a verified collection NFT mint.
  // These details are complex and beyond the scope of a quick example, but here's a conceptual snippet:

  const treeAddress = new PublicKey("..."); // Your merkle tree PDA
  const collectionMintAddress = new PublicKey("..."); // Your verified collection NFT mint
  
  // Create the cNFT
  // NOTE: cNFT minting requires the Metaplex JS SDK with compression support.
  // Pseudocode as the exact method names may differ depending on the Metaplex release:
  
  /*
  const { nft } = await metaplex.compressedNfts().create({
    tree: treeAddress,
    metadataUri,
    name: nftMetadata.name,
    symbol: nftMetadata.symbol,
    sellerFeeBasisPoints: 500, // 5% royalty, adjust as needed
    // Optionally assign a verified collection:
    collection: {
      address: collectionMintAddress,
      verified: true
    },
    // any additional cNFT parameters...
  }).run();

  console.log("Compressed NFT minted:", nft.address.toBase58());
  */

  // Since compressed NFT creation is still evolving, you might need to use the Metaplex SDK's 
  // latest stable or alpha version that supports compression.
  // Check the Metaplex docs for the current method to create compressed NFTs.

  // For now, let's log that we have the metadata, as the cNFT API may vary:
  console.log("Would create cNFT with metadata:", nftMetadata);

  await client.close();
})();
