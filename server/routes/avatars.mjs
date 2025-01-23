/**
 * routes/avatar.js
 *
 * Combines and organizes all avatar-related endpoints in one place.
 */

import express from 'express';
import { ObjectId } from 'mongodb';
import Fuse from 'fuse.js';

// Example imports, adjust paths as needed
import { thumbnailService } from '../services/thumbnailService.mjs';
import { NFTMintingService } from '../../src/services/nftMintService.mjs';
import { StatGenerationService } from '../../src/services/statGenerationService.mjs';
import models from '../../src/models.config.mjs';

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

/**
 * Main export function that returns the configured router.
 */
export default function avatarRoutes(db) {
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

  // -------------------------------------------------
  // 4) POST /claim (claim a random unminted avatar)
  // -------------------------------------------------
  router.post('/claim', async (req, res) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      // Example avatar service not shown in your snippet; you can adapt:
      // e.g., const avatarService = new AvatarGenerationService(db);
      // const randomAvatar = await avatarService.getRandomUnmintedAvatar();
      // We'll assume you have such a function or direct query:
      const randomAvatar = await db.collection('avatars').findOne({ claimed: { $ne: true } });
      if (!randomAvatar) {
        return res.status(404).json({ error: 'No available avatars to claim' });
      }

      // Mark as claimed + mint
      const nftMintService = new NFTMintingService(db);
      await nftMintService.mintAvatarToWallet(randomAvatar._id, walletAddress);

      res.json({ success: true, avatar: randomAvatar });
    } catch (error) {
      console.error('Error claiming avatar (random):', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ---------------------------------------------------------
  // 5) POST /:avatarId/claim (claim a *specific* avatar)
  // ---------------------------------------------------------
  router.post('/:avatarId/claim', async (req, res) => {
    try {
      const { avatarId } = req.params;
      const { walletAddress } = req.body;

      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      const avatar = await db.collection('avatars').findOne({
        _id: new ObjectId(avatarId),
      });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Check if avatar is already claimed (optional logic)
      if (avatar.claimed) {
        return res.status(400).json({ error: 'Avatar already claimed' });
      }

      // Mark as claimed
      await db.collection('avatars').updateOne(
        { _id: new ObjectId(avatarId) },
        { $set: { claimed: true, claimedBy: walletAddress } }
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

  // --------------------------------------------
  // 9) GET /:avatarId/dungeon-actions
  //    (uses "dungeon_log" to fetch avatar’s log)
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
  // 10) GET /:avatarId
  // ------------------------------------
  router.get('/:avatarId', async (req, res) => {
    try {
      const { avatarId } = req.params;

      if (!avatarId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid avatar ID format' });
      }

      const avatar = await db
        .collection('avatars')
        .findOne({ _id: new ObjectId(avatarId) });

      if (!avatar) {
        return res.status(404).json({ error: 'Avatar not found' });
      }

      // Generate thumbnail if needed
      const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
      avatar.thumbnailUrl = thumbnailUrl;

      res.json(avatar);
    } catch (error) {
      console.error('Error fetching avatar details:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // -------------------------------------------------
  // 11) GET /leaderboard
  // -------------------------------------------------
  router.get('/leaderboard', async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
      const skip = (page - 1) * limit;

      const [avatars, total] = await Promise.all([
        db.collection('avatars')
          .find({})
          .sort({ score: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        db.collection('avatars').countDocuments()
      ]);

      // Generate thumbnails for avatars
      const avatarsWithThumbs = await Promise.all(
        avatars.map(async (avatar) => {
          const thumbnailUrl = await thumbnailService.generateThumbnail(avatar.imageUrl);
          return { 
            ...avatar,
            thumbnailUrl,
            score: avatar.score || 0
          };
        })
      );

      return res.json({
        avatars: avatarsWithThumbs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
        // 2) Sort by messageCount desc
        { $sort: { messageCount: -1 } },
        // 3) Lookup avatars matching the case-insensitive username
        {
          $lookup: {
            from: 'avatars',
            let: { username: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toLower: '$name' }, '$$username'],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            as: 'variants',
          },
        },
        // 4) Filter out docs that have no avatars
        { $match: { 'variants.0': { $exists: true } } },
      ];

      // Tier filter (optional)
      if (tier && tier !== 'All') {
        if (tier === 'U') {
          // Untiered => model absent or not in known models
          pipeline.push({
            $match: {
              $or: [
                { 'variants.0.model': { $exists: false } },
                { 'variants.0.model': null },
                {
                  'variants.0.model': {
                    $nin: models.map((m) => m.model),
                  },
                },
              ],
            },
          });
        } else {
          // Filter by models whose rarity => tier
          pipeline.push({
            $match: {
              'variants.0.model': {
                $in: models
                  .filter((m) => rarityToTier[m.rarity] === tier)
                  .map((m) => m.model),
              },
            },
          });
        }
      }

      // Optional "scroll/pagination" using lastMessageCount + lastId
      if (lastMessageCount && lastId) {
        const parsedCount = parseInt(lastMessageCount, 10) || 0;
        pipeline.push({
          $match: {
            $or: [
              { messageCount: { $lt: parsedCount } },
              {
                $and: [
                  { messageCount: parsedCount },
                  { _id: { $gt: lastId } },
                ],
              },
            ],
          },
        });
      }

      // Limit + 1 to detect "hasMore"
      pipeline.push({ $limit: limit + 1 });

      const results = await db
        .collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      // For each aggregated result, pick the first "primary" avatar
      // fetch ancestry + stats, and generate thumbnails
      const details = await Promise.all(
        results.map(async (result) => {
          const variants = result.variants || [];
          const primaryAvatar = variants[0];
          if (!primaryAvatar) return null;

          // Generate thumbnails in parallel
          const thumbs = await Promise.all(
            variants.map((v) => thumbnailService.generateThumbnail(v.imageUrl))
          );

          const avatarId = typeof primaryAvatar._id === 'string' ? new ObjectId(primaryAvatar._id) : primaryAvatar._id;
          const [ancestry, stats] = await Promise.all([
            getAvatarAncestry(db, avatarId),
            db.collection('dungeon_stats').findOne({
              $or: [
                { avatarId: avatarId },
                { avatarId: avatarId.toString() },
              ],
            }),
          ]);

          return {
            ...primaryAvatar,
            variants: variants.map((v, i) => ({
              ...v,
              thumbnailUrl: thumbs[i],
            })),
            ancestry,
            messageCount: result.messageCount,
            lastMessage: result.lastMessage,
            recentMessages: (result.recentMessages || [])
              .filter((m) => m !== null)
              .slice(0, 5),
            stats: stats || { attack: 0, defense: 0, hp: 0 },
            // Example scoreboard formula
            score: result.messageCount,
          };
        })
      );

      const filtered = details.filter(Boolean);
      const hasMore = results.length > limit;
      const lastItem = results.slice(0, limit).pop();

      return res.json({
        avatars: filtered.slice(0, limit),
        hasMore,
        total: filtered.length,
        lastMessageCount: lastItem?.messageCount || null,
        lastId: lastItem?._id || null,
      });
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
