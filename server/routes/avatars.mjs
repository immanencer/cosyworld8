/**
 * routes/avatar.js
 *
 * Combines and organizes all avatar-related endpoints in one place.
 */

import express from 'express';
import { ObjectId } from 'mongodb';


import { thumbnailService } from '../services/thumbnailService.mjs';
import { StatGenerationService } from '../../src/services/statGenerationService.mjs';
import { NFTMintingService } from '../../src/services/nftMintService.mjs';

const router = express.Router();

// ---- Helper Functions ----

// Helper to escape RegExp specials for text search
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main export function that returns the configured router.
 */
export default function avatarRoutes(db) {
  router.get('/', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
      const skip = (page - 1) * limit;
      const view = req.query.view || 'all';

      let query = {};
      let sort = { createdAt: -1 };

      if (view === 'owned' && req.query.walletAddress) {
        const walletAddress = req.query.walletAddress;

        // Fetch avatar IDs from both x_auth and avatar_claims
        const [xAuths, avatarClaims] = await Promise.all([
          db.collection('x_auth').find({ walletAddress }).toArray(),
          db.collection('avatar_claims').find({ walletAddress }).toArray()
        ]);

        // Map to ObjectIds (if needed)
        const xAuthAvatarIds = xAuths.map(auth =>
          typeof auth.avatarId === 'string'
            ? new ObjectId(auth.avatarId)
            : auth.avatarId
        );
        const claimAvatarIds = avatarClaims.map(claim =>
          typeof claim.avatarId === 'string'
            ? new ObjectId(claim.avatarId)
            : claim.avatarId
        );

        // Combine both lists and remove duplicates.
        // We convert ObjectIds to strings to deduplicate, then convert back.
        const authorizedAvatarIds = [...new Set(
          [...xAuthAvatarIds, ...claimAvatarIds].map(id => id.toString())
        )].map(id => new ObjectId(id));

        query._id = { $in: authorizedAvatarIds };
      }

      const [avatars, total] = await Promise.all([
        db.collection('avatars')
          .find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('avatars').countDocuments(query)
      ]);

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

      res.json({
        avatars: avatarsWithThumbs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      });
    } catch (error) {
      console.error('Avatar listing error:', error);
      res.status(500).json({
        error: 'Failed to fetch avatars',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });


  // ------------------------------------
  // GET /:avatarId
  // Returns the avatar details along with its inventory
  // ------------------------------------
  router.get('/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;
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

      const avatar = await db.collection('avatars').findOne(query);

      if (!avatar) {
        console.error(`Avatar not found for id/name: ${avatarId}`);
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Generate thumbnail for the avatar image if needed
      const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
      avatar.thumbnailUrl = thumbnailUrl;

      // Fetch inventory items for this avatar (items where "owner" matches the avatar's _id)
      const items = await db.collection('items').find({
        owner: new ObjectId(avatar._id)
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

      res.json(avatar);
    } catch (error) {
      console.error('Error fetching avatar details:', error);
      res.status(500).json({
        error: 'Failed to fetch avatar details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

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

      // Example logic for "owned" filtering, using x_auth:
      if (view === 'owned' && req.query.walletAddress) {
        const xAuths = await db.collection('x_auth')
          .find({ walletAddress: req.query.walletAddress })
          .toArray();

        const authorizedAvatarIds = xAuths.map((auth) => {
          return typeof auth.avatarId === 'string'
            ? new ObjectId(auth.avatarId)
            : auth.avatarId;
        });

        query._id = { $in: authorizedAvatarIds };
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

      res.json({
        avatars: avatarsWithThumbs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
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

      if (!name || name.length < 2) {
        return res.json({ avatars: [] });
      }

      const regex = new RegExp(escapeRegExp(name), 'i');
      const found = await db
        .collection('avatars')
        .find({ name: regex })
        .limit(5)
        .toArray();

      // Generate thumbnails
      const avatars = await Promise.all(
        found.map(async (avatar) => {
          const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
          return { ...avatar, thumbnailUrl };
        })
      );

      res.json({ avatars });
    } catch (error) {
      console.error('Avatar search error:', error);
      res.status(500).json({ error: error.message });
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
        const statService = new StatGenerationService();
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
      const avatar = await db.collection('avatars').findOne({
        _id: new ObjectId(avatarId)
      });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      const statService = new StatGenerationService();

      // Try to get existing stats first
      let stats = await db.collection('dungeon_stats').findOne({
        avatarId: new ObjectId(avatarId)
      });

      // Generate new stats if none exist or if current stats are invalid
      if (!stats || !statService.validateStats(stats)) {
        stats = statService.generateStatsFromDate(avatar.createdAt || new Date());
        // Save generated stats
        await db.collection('dungeon_stats').updateOne(
          { avatarId: new ObjectId(avatarId) },
          { $set: stats },
          { upsert: true }
        );
      }

      res.json(stats);
    } catch (error) {
      console.error('Error getting avatar stats:', error);
      res.status(500).json({ error: error.message });
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



  return router;
}