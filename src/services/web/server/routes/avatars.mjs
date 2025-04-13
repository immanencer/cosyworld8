/**
 * routes/avatar.js
 *
 * Combines and organizes all avatar-related endpoints in one place.
 */

import express from 'express';
import { ObjectId } from 'mongodb';


import { thumbnailService } from '../services/thumbnailService.mjs';
import { StatService } from '../../../battle/statService.mjs';
import { NFTMintingService } from '../../../blockchain/nftMintService.mjs';

const router = express.Router();

// ---- Helper Functions ----

// Helper to escape RegExp specials for text search
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Map rarities to a "tier" label (used in advanced leaderboard example)
const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

/**
 * Returns the ancestry (parent chain) of an avatar by iterating up the family tree.
 * Example usage in an advanced leaderboard scenario.
 */
async function getAvatarAncestry(db, avatarId) {
  const ancestry = [];
  let currentAvatar = await db.collection('avatars').findOne(
    { _id: new ObjectId(avatarId) },
    { projection: { parents: 1 } }
  );

  while (currentAvatar?.parents?.length) {
    const parentId = currentAvatar.parents[0];
    const parent = await db.collection('avatars').findOne(
      { _id: new ObjectId(parentId) },
      { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1, parents: 1 } }
    );
    if (!parent) break;
    ancestry.push(parent);
    currentAvatar = parent;
  }

  return ancestry;
}

// Schema for avatar data
const avatarSchema = {
  _id: 1,
  name: 1,
  imageUrl: 1,
  thumbnailUrl: 1,
  createdAt: 1,
  claimed: 1,
  claimedBy: 1,
  emoji: 1,
  stats: 1,
};

/**
 * Main export function that returns the configured router.
 */
export default function avatarRoutes(db) {
  if (!db) {
    throw new Error("Database instance is not initialized. Ensure 'db' is passed to avatarRoutes.");
  }

  // -----------------------------
  // 1) GET / (paginated avatars)
  // -----------------------------
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
      const skip = (page - 1) * limit;
      const view = req.query.view || 'all'; // e.g. 'gallery', 'owned', 'all'

      let query = {};
      let sort = { createdAt: -1 };

      if (view === 'claims' && !req.query.walletAddress) {
        return res.status(400).json({ error: 'walletAddress required for claims view' });
      }

      // Example logic for "owned" filtering:
      if (view === 'claims') {
        // Get avatars from both X auth and avatar claims collections
        const [xAuths, avatarClaims] = await Promise.all([
          db.collection('x_auth')
            .find({ walletAddress: req.query.walletAddress })
            .toArray(),
          db.collection('avatar_claims')
            .find({ walletAddress: req.query.walletAddress.toLowerCase() })
            .toArray()
        ]);

        // Combine avatar IDs from both sources
        const authorizedAvatarIds = [
          ...xAuths.map(auth => {
            return typeof auth.avatarId === 'string'
              ? new ObjectId(auth.avatarId)
              : auth.avatarId;
          }),
          ...avatarClaims.map(claim => {
            return typeof claim.avatarId === 'string'
              ? new ObjectId(claim.avatarId)
              : claim.avatarId;
          })
        ];

        // Filter out duplicates (if same avatar appears in both collections)
        const uniqueIds = [...new Map(authorizedAvatarIds.map(id =>
          [id.toString(), id])).values()];

        query._id = { $in: uniqueIds };
      }

      const [avatars, total] = await Promise.all([
        db.collection('avatars')
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('avatars').countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);
      if (page > totalPages && total > 0) {
        return res.json({ avatars: [], total, page, totalPages, limit });
      }

      // Generate thumbnails
      await thumbnailService.ensureThumbnailDir();
      const avatarsWithThumbs = await Promise.all(
        avatars.map(async (avatar) => {
          try {
            const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
            return { ...avatar, thumbnailUrl };
          } catch (err) {
            console.error(`Thumbnail failed for avatar ${avatar._id}:`, err);
            return { ...avatar, thumbnailUrl: avatar.imageUrl };
          }
        })
      );

      // Get Crossmint template IDs for these avatars
      const avatarIds = avatarsWithThumbs.map(avatar => avatar._id.toString());
      const crossmintData = await db.collection('crossmint_dev')
        .find({ 
          avatarId: { $in: avatarIds },
          chain: 'base'
        })
        .toArray();

      // Create a lookup map for faster access
      const templateMap = {};
      crossmintData.forEach(item => {
        templateMap[item.avatarId] = {
          templateId: item.templateId,
          collectionId: item.collectionId
        };
      });

      // Add template info to avatars
      const avatarsWithTemplates = avatarsWithThumbs.map(avatar => {
        const templateInfo = templateMap[avatar._id.toString()];
        if (templateInfo) {
          return {
            ...avatar,
            templateId: templateInfo.templateId,
            collectionId: templateInfo.collectionId
          };
        }
        return avatar;
      });



      res.json({
        avatars: avatarsWithTemplates,
        total,
        page,
        totalPages,
        limit,
      });
    } catch (error) {
      console.error('Avatar listing error:', error);
      res.status(500).json({
        error: 'Failed to fetch avatars',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // ----------------------------------
  // 2) GET /search (by avatar name)
  // ----------------------------------
  router.get('/search', async (req, res) => {
    try {
      const { name } = req.query;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ error: 'Search term must be at least 2 characters long' });
      }

      const regex = new RegExp(escapeRegExp(name.trim()), 'i');
      const found = await db.collection('avatars').find({ name: regex }).limit(10).toArray();

      const avatars = await Promise.all(
        found.map(async (avatar) => {
          const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
          return { ...avatar, thumbnailUrl };
        })
      );

      res.json({ avatars });
    } catch (error) {
      console.error('Avatar search error:', error);
      res.status(500).json({ error: 'Failed to search avatars' });
    }
  });

  // ------------------------------------------
  // 3) GET /owned/:publicKey (NFT ownership)
  // ------------------------------------------
  router.get('/owned/:publicKey', async (req, res) => {
    try {
      const { publicKey } = req.params;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 12;
      const skip = (page - 1) * limit;

      if (!publicKey) {
        return res.status(400).json({ error: 'Public key required' });
      }

      const nftMintService = new NFTMintingService(db);
      const ownedAvatars = await nftMintService.getAvatarsByOwner(publicKey, skip, limit);

      res.json({
        avatars: ownedAvatars || [],
        hasMore: (ownedAvatars || []).length === limit,
      });
    } catch (error) {
      console.error('Error fetching owned avatars:', error);
      res.status(500).json({ error: error.message });
    }
  });


  // 5) POST /:avatarId/claim (claim a *specific* avatar)
  router.post('/:avatarId/claim', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { walletAddress, burnTxSignature } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      if (!burnTxSignature) {
        return res.status(400).json({ error: 'Burn transaction signature required' });
      }

      const avatar = await db.collection('avatars').findOne({
        _id: new ObjectId(avatarId),
      });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Check if the avatar is already claimed
      const existingClaim = await db.collection('avatar_claims').findOne({
        avatarId: new ObjectId(avatarId)
      });

      if (existingClaim) {
        if (existingClaim.walletAddress === walletAddress) {
          return res.json({ success: true, alreadyOwned: true });
        }
        return res.status(400).json({ error: 'Avatar already claimed by another wallet' });
      }

      // Verify burn transaction
      const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
      const burnService = new TokenBurnService(connection);
      const burnVerified = await burnService.verifyBurnTransaction(burnTxSignature);

      if (!burnVerified) {
        return res.status(400).json({ error: 'Invalid or unconfirmed burn transaction' });
      }

      // Use NFTMintingService to mark the avatar as ready to mint for this wallet
      const nftMintService = new NFTMintingService(db);
      await nftMintService.markAvatarForMint(avatarId, walletAddress);

      // Record the burn transaction
      await db.collection('avatar_claims').updateOne(
        { avatarId: new ObjectId(avatarId) },
        {
          $set: {
            walletAddress,
            burnTxSignature,
            claimedAt: new Date()
          }
        },
        { upsert: true }
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error claiming avatar (by ID):', error);
      res.status(500).json({ error: error.message });
    }
  });

    // ------------------------------------
  // GET /:avatarId
  // Returns the avatar details along with its inventory
  // ------------------------------------
  router.get('/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;

      // Ensure the database collection is accessible
      if (!db || !db.collection) {
        throw new Error("Database instance or collection is not initialized. Check the 'db' instance.");
      }

      let query;

      // Allow lookup by ObjectId or name
      try {
        query = {
          $or: [
            { _id: new ObjectId(avatarId) },
            { _id: avatarId },
            { name: avatarId }
          ]
        };
      } catch (err) {
        query = {
          $or: [
            { _id: avatarId },
            { name: avatarId }
          ]
        };
      }

      const avatar = await db.collection('avatars').findOne(query, { projection: avatarSchema });

      if (!avatar) {
        console.error(`Avatar not found for id/name: ${avatarId}`);
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Generate thumbnail for the avatar image if needed
      const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
      avatar.thumbnailUrl = thumbnailUrl;

      // Fetch inventory items for this avatar (items where "owner" matches the avatar's _id)
      const items = await db.collection('items').find({
        owner: avatar._id
      }).toArray();

      // Generate thumbnails for each inventory item if needed
      const itemsWithThumbs = await Promise.all(
        items.map(async (item) => {
          if (!item.thumbnailUrl && item.imageUrl) {
            item.thumbnailUrl = await thumbnailService.generateThumbnail(item.imageUrl);
          }
          return item;
        })
      );

      // Attach the inventory to the avatar object
      avatar.inventory = itemsWithThumbs;

      // Check if this avatar has a Crossmint template
      const crossmintData = await db.collection('crossmint_dev').findOne({ 
        avatarId: avatar._id.toString(),
        chain: 'base' // Only look for Base chain mints
      });

      if (crossmintData) {
        avatar.templateId = crossmintData.templateId;
        avatar.collectionId = crossmintData.collectionId;
      }

      res.json(avatar);
    } catch (error) {
      console.error('Error fetching avatar details:', error);
      res.status(500).json({
        error: 'Failed to fetch avatar details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // ------------------------------------
  // 6) GET /:avatarId/location
  // ------------------------------------
  router.get('/:avatarId/location', async (req, res) => {
    try {
      // Make sure avatarId is a valid ObjectId if needed:
      const avatarId = req.params.avatarId;
      const avatar = await db.collection('avatars').findOne(
        { _id: new ObjectId(avatarId) },
        { projection: { currentLocation: 1 } }
      );

      if (!avatar?.currentLocation) {
        return res.json({ location: null });
      }

      const location = await db.collection('locations').findOne({
        _id: avatar.currentLocation,
      });

      res.json({ location });
    } catch (error) {
      console.error('Error fetching avatar location:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ------------------------------------
  // 7) GET /:avatarId/memories
  //    (Unified advanced version)
  // ------------------------------------
  router.get('/:avatarId/memories', async (req, res) => {
    try {
      const { avatarId } = req.params;

      // Some docs store ObjectIds, some strings; handle both
      const query = {
        $or: [
          { avatarId: new ObjectId(avatarId) },
          { avatarId },
        ],
      };

      const memories = await db
        .collection('memories')
        .find(query)
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      res.json({ memories });
    } catch (error) {
      console.error('Error fetching avatar memories:', error);
      res.status(500).json({ error: error.message, memories: [] });
    }
  });

  // --------------------------------------------------------
  // 8) GET /:avatarId/narratives
  //    (Unified advanced version - auto-generate dungeonStats)
  // --------------------------------------------------------
  router.get('/:avatarId/narratives', async (req, res) => {
    try {
      const avatarId = new ObjectId(req.params.avatarId);

      // Fetch data in parallel
      const [narratives, messages, existingStats] = await Promise.all([
        db.collection('narratives')
          .find({ avatarId })
          .sort({ timestamp: -1 })
          .limit(10)
          .toArray(),
        db.collection('messages')
          .find({ avatarId })
          .sort({ timestamp: -1 })
          .limit(5)
          .toArray(),
        db.collection('dungeon_stats').findOne({ avatarId }),
      ]);

      // If no dungeon stats exist, generate and upsert
      let dungeonStats = existingStats;
      if (!existingStats) {
        const statService = new StatService();
        const avatar = await db.collection('avatars').findOne({ _id: avatarId });

        // Example: generate stats from creation date
        const generatedStats = statService.generateStatsFromDate(
          avatar?.createdAt || new Date()
        );

        const upserted = await db.collection('dungeon_stats').findOneAndUpdate(
          { avatarId },
          { $set: { ...generatedStats, avatarId } },
          { upsert: true, returnDocument: 'after' }
        );

        dungeonStats = upserted.value;
      }

      res.json({
        narratives,
        recentMessages: messages,
        dungeonStats,
      });
    } catch (error) {
      console.error('Error fetching narratives:', error);
      res.status(500).json({
        error: error.message,
        narratives: [],
        recentMessages: [],
        dungeonStats: { attack: 0, defense: 0, hp: 0 },
      });
    }
  });

  // ------------------------------------
  // 9) GET /:avatarId/stats
  // ------------------------------------
  router.get('/:avatarId/stats', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const avatar = await db.collection('avatars').findOne({ _id: new ObjectId(avatarId) });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const statService = new StatService();

      // Check if createdAt exists and is valid
      if (!avatar.createdAt) {
        console.warn(`Avatar ${avatarId} does not have a createdAt date, using current date`);
        avatar.createdAt = new Date().toISOString();

        // Update the avatar with a createdAt date
        await db.collection('avatars').updateOne(
          { _id: new ObjectId(avatarId) },
          { $set: { createdAt: avatar.createdAt } }
        );
      }

      const stats = statService.generateStatsFromDate(avatar.createdAt);

      res.json(stats);
    } catch (error) {
      console.error('Error getting avatar stats:', error);
      res.status(500).json({ error: 'Could not generate avatar stats' });
    }
  });

  // --------------------------------------------
  // 10) GET /:avatarId/dungeon-actions
  //    (uses "dungeon_log" to fetch avatar's log)
  // --------------------------------------------
  router.get('/:avatarId/dungeon-actions', async (req, res) => {
    try {
      const avatarId = new ObjectId(req.params.avatarId);

      const avatar = await db
        .collection('avatars')
        .findOne({ _id: avatarId }, { projection: { name: 1 } });
      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const actions = await db
        .collection('dungeon_log')
        .find({
          $or: [
            { actor: avatar.name },
            { target: avatar.name },
          ],
        })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      res.json({ actions });
    } catch (error) {
      console.error('Error fetching dungeon actions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ------------------------------------
  // GET /:avatarId/inventory
  // Returns the inventory items for the specified avatar.
  // ------------------------------------
  router.get('/:avatarId/inventory', async (req, res) => {
    try {
      const { avatarId } = req.params;
      // Query the items collection for items owned by the avatar.
      // Adjust the query if your schema stores the owner as a string or differently.
      const items = await db.collection('items').find({
        owner: new ObjectId(avatarId)
      }).toArray();

      // Generate thumbnails for each item if needed.
      const itemsWithThumbs = await Promise.all(
        items.map(async (item) => {
          if (!item.thumbnailUrl && item.imageUrl) {
            item.thumbnailUrl = await thumbnailService.generateThumbnail(item.imageUrl);
          }
          return item;
        })
      );

      res.json({ items: itemsWithThumbs });
    } catch (error) {
      console.error('Error fetching inventory for avatar:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ------------------------------------
  // GET /:avatarId/status
  // Returns the account link status for the specified avatar.
  // ------------------------------------
  router.get('/:avatarId/status', async (req, res) => {
    try {
      const { avatarId } = req.params;
      // Try to parse avatarId as an ObjectId
      const id = new ObjectId(avatarId);

      // Check if the avatar has been claimed
      const claim = await db.collection('avatar_claims').findOne({ avatarId: id });

      // Check if the X account is linked (from x_auth collection)
      const xAuth = await db.collection('x_auth').findOne({ avatarId: id });

      // Retrieve the avatar to check SPL token creation status.
      const avatar = await db.collection('avatars').findOne({ _id: id });

      res.json({
        claimed: !!claim,
        walletAddress: claim ? claim.walletAddress : null,
        burnTxSignature: claim ? claim.burnTxSignature : null,
        splTokenCreated: avatar?.splTokenCreated || false, // adjust if you store this elsewhere
        xAccountLinked: !!xAuth,
        xAccountData: xAuth || null,
      });
    } catch (error) {
      console.error('Error fetching avatar status:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add a new route to handle fetching avatar details by name or ID
  router.get('/details/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      let query;

      // Allow lookup by ObjectId or name
      try {
        query = {
          $or: [
            { _id: new ObjectId(identifier) },
            { name: identifier }
          ]
        };
      } catch (err) {
        query = { name: identifier };
      }

      const avatar = await db.collection('avatars').findOne(query, { projection: avatarSchema });

      if (!avatar) {
        console.error(`Avatar not found for identifier: ${identifier}`);
        return res.status(404).json({ error: '404: Avatar details not found' });
      }

      // Check if this avatar has a Crossmint template
      const crossmintData = await db.collection('crossmint_dev').findOne({ 
        avatarId: avatar._id.toString(),
        chain: 'base' // Only look for Base chain mints
      });

      if (crossmintData) {
        avatar.templateId = crossmintData.templateId;
        avatar.collectionId = crossmintData.collectionId;
      }

      res.json(avatar);
    } catch (error) {
      console.error('Error fetching avatar details:', error);
      res.status(500).json({
        error: 'Failed to fetch avatar details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  router.get('/:avatarId/social-posts', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const posts = await db.collection('social_posts').find({ avatarId }).toArray();
      res.json(posts);
    } catch (error) {
      console.error('Error fetching social posts:', error);
      res.status(500).json({ error: 'Failed to fetch social posts' });
    }
  });

  return router;
}