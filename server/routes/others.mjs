/**
 * routes/others.mjs
 *
 * Contains the leaderboard routes, dungeon log route, and health check.
 */
import { Router } from 'express';
import { ObjectId } from 'mongodb';
import Fuse from 'fuse.js';

// Example services/config you use in these routes:
import { thumbnailService } from '../services/thumbnailService.mjs';
import models from '../../src/models.config.mjs';

// ----- Local Helpers (Duplicate as needed) -----

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

/**
 * Escape a string for safe usage in a RegExp.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * If you need the ancestry function here, replicate it:
 * (Optionally you can remove or import from a shared utility.)
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

export default function otherRoutes(db) {
  // Create an Express Router
  const router = Router();

  /**
   * GET /api/leaderboard/minted
   * Returns top minted NFTs with stats; up to 100 results, sorted by a simple score formula.
   */
  router.get('/leaderboard/minted', async (req, res) => {
    try {
      const mintedAvatars = await db
        .collection('minted_nfts')
        .aggregate([
          {
            $lookup: {
              from: 'avatars',
              localField: 'avatarId',
              foreignField: '_id',
              as: 'avatar',
            },
          },
          { $unwind: '$avatar' },
          {
            $lookup: {
              from: 'dungeon_stats',
              localField: 'avatarId',
              foreignField: 'avatarId',
              as: 'stats',
            },
          },
          { $unwind: { path: '$stats', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: '$avatar._id',
              name: '$avatar.name',
              imageUrl: '$avatar.imageUrl',
              thumbnailUrl: '$avatar.thumbnailUrl',
              score: {
                $add: [
                  { $ifNull: ['$stats.wins', 0] },
                  {
                    $multiply: [
                      { $ifNull: ['$stats.hp', 0] },
                      10,
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { score: -1 } },
          { $limit: 100 },
        ])
        .toArray();

      res.json(mintedAvatars);
    } catch (error) {
      console.error('Minted leaderboard error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/leaderboard
   * Aggregates messages by username => finds matching avatars => returns a paginated leaderboard.
   */
  router.get('/leaderboard', async (req, res) => {
    try {
      const { tier, lastMessageCount, lastId, limit: limitStr } = req.query;
      // Default limit 24, but never exceed 100
      const limit = Math.min(parseInt(limitStr, 10) || 24, 100);

      // Pipeline stages
      const pipeline = [
        // 1) Group messages by case-insensitive authorUsername
        {
          $group: {
            _id: { $toLower: '$authorUsername' },
            messageCount: { $sum: 1 },
            lastMessage: { $max: '$timestamp' },
            recentMessages: {
              $push: {
                $cond: {
                  if: {
                    $gte: [
                      '$timestamp',
                      { $subtract: [new Date(), 1000 * 60 * 60 * 24] },
                    ],
                  },
                  then: {
                    content: { $substr: ['$content', 0, 200] },
                    timestamp: '$timestamp',
                  },
                  else: null,
                },
              },
            },
          },
        },
        // 2) Sort by messageCount desc
        { $sort: { messageCount: -1 } },
        // 3) Lookup avatars matching case-insensitive username
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
        // 4) Keep only docs that have at least one avatar
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

      // Limit + 1 for "hasMore" detection
      pipeline.push({ $limit: limit + 1 });

      const results = await db
        .collection('messages')
        .aggregate(pipeline, { allowDiskUse: true })
        .toArray();

      // For each aggregated result, pick the first "primary" avatar, fetch ancestry + stats
      const details = await Promise.all(
        results.map(async (result) => {
          const variants = result.variants || [];
          const primaryAvatar = variants[0];
          if (!primaryAvatar) return null;

          // Generate thumbnails in parallel
          const thumbs = await Promise.all(
            variants.map((v) =>
              thumbnailService.generateThumbnail(v.imageUrl)
            )
          );

          const [ancestry, stats] = await Promise.all([
            getAvatarAncestry(db, primaryAvatar._id),
            db.collection('dungeon_stats').findOne({
              $or: [
                { avatarId: primaryAvatar._id },
                { avatarId: primaryAvatar._id.toString() },
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

  /**
   * GET /api/dungeon/log
   * Returns up to 50 latest dungeon log entries, enriched with actor/target stats & additional data.
   */
  router.get('/dungeon/log', async (req, res) => {
    try {
      const combatLog = await db
        .collection('dungeon_log')
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();

      // Gather location names from "move" actions
      const locationNames = [
        ...new Set(
          combatLog
            .filter((log) => (log.action === 'move' || log.location) && log.target)
            .map((log) => log.target)
        ),
      ];

      // Grab all locations from DB
      const allLocations = await db
        .collection('locations')
        .find({}, { projection: { name: 1, description: 1, imageUrl: 1, updatedAt: 1 } })
        .toArray();

      // Approx match with Fuse
      const fuse = new Fuse(allLocations, {
        keys: ['name'],
        threshold: 0.4,
      });

      // Map each locationName to the best match
      const locationDetails = locationNames.reduce((acc, name) => {
        const [result] = fuse.search(name);
        if (result) {
          acc[name] = {
            name: result.item.name,
            description: result.item.description,
            imageUrl: result.item.imageUrl,
            updatedAt: result.item.updatedAt,
          };
        }
        return acc;
      }, {});

      // Enrich each log entry
      const enrichedLog = await Promise.all(
        combatLog.map(async (entry) => {
          // 1) Find Avatars for actor & target
          const [actor, target] = await Promise.all([
            // Actor
            db.collection('avatars').findOne(
              { name: entry.actor },
              { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
            ) ||
            db.collection('avatars').findOne(
              {
                name: {
                  $regex: `^${escapeRegExp(entry.actor)}$`,
                  $options: 'i',
                },
              },
              { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
            ),
            // Target
            entry.target
              ? db.collection('avatars').findOne(
                { name: entry.target },
                { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
              ) ||
              db.collection('avatars').findOne(
                {
                  name: {
                    $regex: `^${escapeRegExp(entry.target)}$`,
                    $options: 'i',
                  },
                },
                { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
              )
              : null,
          ]);

          // 2) Generate thumbnails
          const [actorThumb, targetThumb] = await Promise.all([
            actor?.imageUrl
              ? thumbnailService.generateThumbnail(actor.imageUrl)
              : null,
            target?.imageUrl
              ? thumbnailService.generateThumbnail(target.imageUrl)
              : null,
          ]);

          // 3) Fetch stats
          const [actorStats, targetStats] = await Promise.all([
            actor
              ? db.collection('dungeon_stats').findOne({
                avatarId: actor._id.toString(),
              })
              : null,
            target
              ? db.collection('dungeon_stats').findOne({
                avatarId: target._id?.toString(),
              })
              : null,
          ]);

          // 4) Additional data based on action
          const additionalData = {};
          if (entry.action === 'remember') {
            const memory = await db.collection('memories').findOne({
              avatarId: actor?._id,
              timestamp: entry.timestamp,
            });
            if (memory) additionalData.memory = memory.content;
          } else if (entry.action === 'xpost') {
            const tweet = await db.collection('tweets').findOne({
              avatarId: actor?._id,
              timestamp: entry.timestamp,
            });
            if (tweet) additionalData.tweet = tweet.content;
          }

          // Identify location from either `entry.target` or `entry.location`
          const locationKey = entry.target || entry.location;
          const locationData = locationDetails[locationKey];

          // For move actions, preserve backward-compat "targetImageUrl"
          if (entry.action === 'move' && locationData?.imageUrl) {
            additionalData.targetImageUrl = locationData.imageUrl;
          }

          additionalData.location = locationData
            ? {
              name: locationData.name,
              imageUrl: locationData.imageUrl || null,
              description: locationData.description || '',
            }
            : null;

          return {
            ...entry,
            actorId: actor?._id || null,
            actorName: actor?.name || entry.actor,
            actorEmoji: actor?.emoji || null,
            actorImageUrl: actor?.imageUrl || null,
            actorThumbnailUrl: actorThumb,
            actorStats,
            targetId: target?._id || null,
            targetName: target?.name || entry.target,
            targetEmoji: target?.emoji || null,
            targetImageUrl: target?.imageUrl || null,
            targetThumbnailUrl: targetThumb,
            targetStats,
            ...additionalData,
          };
        })
      );

      res.json(enrichedLog);
    } catch (error) {
      console.error('Error fetching dungeon log:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/health
   * Basic health check endpoint.
   */
  router.get('/health', async (req, res) => {
    try {
      // If you previously used a "ensureDbConnection()" helper, you can do:
      if (!db) {
        return res.status(503).json({
          status: 'error',
          message: 'Database not connected',
        });
      }
      // Optionally: await db.command({ ping: 1 }); // to verify connectivity
      res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        message: 'Database not connected',
      });
    }
  });

  return router;
}
