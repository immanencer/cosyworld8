import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import Fuse from 'fuse.js';

import models from '../src/models.config.mjs'; // your custom config
import avatarRoutes from './routes/avatars.mjs'; // external routes
import tribeRoutes from './routes/tribes.mjs';
import xauthRoutes from './routes/xauth.mjs';
import wikiRoutes from './routes/wiki.mjs';
import { thumbnailService } from './services/thumbnailService.mjs';

// ----- Express & Environment Setup -----
const app = express();
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ----- MongoDB Setup -----
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'cosyworld';
const mongoClient = new MongoClient(mongoUri);

let db = null;

/**
 * A small helper to ensure `db` is available.
 * Throws an error if the DB is not yet connected.
 */
function ensureDbConnection() {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

/**
 * Initialize all required indexes in the database.
 * @param {import('mongodb').Db} database
 */
async function initializeIndexes(database) {
  try {
    // Avatars
    await database.collection('avatars').createIndexes([
      { key: { name: 1 }, background: true },
      { key: { emoji: 1 }, background: true },
      { key: { parents: 1 }, background: true },
      { key: { model: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { name: 'text', description: 'text' }, background: true },
    ]);

    // Messages
    await database.collection('messages').createIndexes([
      { key: { authorUsername: 1 }, background: true },
      { key: { timestamp: -1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    // Narratives
    await database.collection('narratives').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Memories
    await database.collection('memories').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Dungeon Stats
    await database.collection('dungeon_stats').createIndexes([
      { key: { avatarId: 1 }, unique: true, background: true },
    ]);

    // Dungeon Log
    await database.collection('dungeon_log').createIndexes([
      { key: { timestamp: -1 }, background: true },
      { key: { actor: 1 }, background: true },
      { key: { target: 1 }, background: true },
    ]);

    // Token Transactions
    await database.collection('token_transactions').createIndexes([
      { key: { walletAddress: 1, timestamp: -1 }, background: true },
      { key: { transactionSignature: 1 }, unique: true, background: true },
    ]);

    // Minted NFTs
    await database.collection('minted_nfts').createIndexes([
      { key: { walletAddress: 1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Connect to MongoDB once during startup
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set, using default localhost');
    }

    await mongoClient.connect();
    db = mongoClient.db(mongoDbName);

    // Display some minimal info
    console.log(`Connected to MongoDB database: ${mongoDbName}`);

    // Initialize indexes
    await initializeIndexes(db);

    // Mount external routes that depend on `db`
    app.use('/api/avatars', await avatarRoutes(db));
    app.use('/api/tribes', await tribeRoutes(db));
    app.use('/api/xauth', await xauthRoutes(db));
    app.use('/api/wiki', wikiRoutes);
    app.use(
      '/api/models',
      await import('./routes/models.mjs').then((m) => m.default(db))
    );

    // Start Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// ---- Helper Functions ----

const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

/**
 * Escapes a string for use in a RegExp pattern.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the ancestry (parent chain) of an avatar by iterating up the family tree.
 * @param {import('mongodb').Db} database
 * @param {string|ObjectId} avatarId
 * @returns {Promise<Array>} The ancestry chain from child to oldest parent.
 */
async function getAvatarAncestry(database, avatarId) {
  const ancestry = [];
  let currentAvatar = await database.collection('avatars').findOne(
    { _id: new ObjectId(avatarId) },
    { projection: { parents: 1 } }
  );

  while (currentAvatar?.parents?.length) {
    const parentId = currentAvatar.parents[0];
    const parent = await database.collection('avatars').findOne(
      { _id: new ObjectId(parentId) },
      { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1, parents: 1 } }
    );
    if (!parent) break;
    ancestry.push(parent);
    currentAvatar = parent;
  }

  return ancestry;
}

// ---- Leaderboard Routes ----

/**
 * GET /api/leaderboard/minted
 * Returns top minted NFTs with stats; up to 100 results, sorted by a simple score formula.
 */
app.get('/api/leaderboard/minted', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const mintedAvatars = await database
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
app.get('/api/leaderboard', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const { tier, lastMessageCount, lastId, limit: limitStr } = req.query;
    // Default limit 24, but never exceed 100
    const limit = Math.min(parseInt(limitStr, 10) || 24, 100);

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
        // Untiered => model is absent or not in known models
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
    // (Be aware that _id here is a string from $group, so $gt is lexical.)
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

    const results = await database
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
          getAvatarAncestry(database, primaryAvatar._id),
          database.collection('dungeon_stats').findOne({
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
          recentMessages: result.recentMessages
            .filter((m) => m !== null)
            .slice(0, 5),
          stats: stats || { attack: 0, defense: 0, hp: 0 },
          // Simple scoreboard formula (customize as needed)
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

// ---- Avatar-Related Routes ----

/**
 * GET /api/avatar/:id/narratives
 * Returns narratives, recent messages, and dungeon stats in one response.
 */
app.get('/api/avatar/:id/narratives', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const avatarId = new ObjectId(req.params.id);

    // Fetch data in parallel
    const [narratives, messages, existingStats] = await Promise.all([
      database
        .collection('narratives')
        .find({ avatarId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray(),
      database
        .collection('messages')
        .find({ avatarId })
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray(),
      database.collection('dungeon_stats').findOne({ avatarId }),
    ]);

    // If no dungeon stats exist, generate and upsert
    let dungeonStats = existingStats;
    if (!existingStats) {
      const { StatGenerationService } = await import(
        '../src/services/statGenerationService.mjs'
      );
      const statService = new StatGenerationService();

      const avatar = await database
        .collection('avatars')
        .findOne({ _id: avatarId });
      const generatedStats = statService.generateStatsFromDate(
        avatar?.createdAt || new Date()
      );

      const upserted = await database.collection('dungeon_stats').findOneAndUpdate(
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

/**
 * GET /api/avatar/:id/memories
 * Returns up to 10 recent memories for the given avatarId.
 */
app.get('/api/avatar/:id/memories', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const id = req.params.id;

    // Some docs stored as strings, some as ObjectId
    const query = {
      $or: [{ avatarId: new ObjectId(id) }, { avatarId: id }],
    };

    const memories = await database
      .collection('memories')
      .find(query)
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json({ memories });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: error.message, memories: [] });
  }
});

/**
 * GET /api/avatar/:id/dungeon-actions
 * Returns up to 10 latest actions in the dungeon log for this avatar.
 */
app.get('/api/avatar/:id/dungeon-actions', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const avatarId = new ObjectId(req.params.id);

    const avatar = await database
      .collection('avatars')
      .findOne({ _id: avatarId }, { projection: { name: 1 } });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const actions = await database
      .collection('dungeon_log')
      .find({
        $or: [{ actor: avatar.name }, { target: avatar.name }],
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json(actions);
  } catch (error) {
    console.error('Error fetching dungeon actions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/avatars/search
 * Returns up to 5 avatars whose name matches the query (case-insensitive).
 */
app.get('/api/avatars/search', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const { name } = req.query;

    if (!name || name.length < 2) {
      return res.json({ avatars: [] });
    }

    const regex = new RegExp(escapeRegExp(name), 'i');
    const found = await database
      .collection('avatars')
      .find({ name: regex })
      .limit(5)
      .toArray();

    // Generate thumbnails in parallel
    const avatars = await Promise.all(
      found.map(async (avatar) => ({
        ...avatar,
        thumbnailUrl: await thumbnailService.generateThumbnail(avatar.imageUrl),
      }))
    );

    res.json({ avatars });
  } catch (error) {
    console.error('Avatar search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Dungeon Log Endpoint ----

/**
 * GET /api/dungeon/log
 * Returns up to 50 latest dungeon log entries, enriched with actor/target stats & additional data.
 */
app.get('/api/dungeon/log', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const combatLog = await database
      .collection('dungeon_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Gather location names from move actions
    const locationNames = [
      ...new Set(
        combatLog
          .filter((log) => (log.action === 'move' || log.location) && log.target)
          .map((log) => log.target)
      ),
    ];

    // Grab all locations from DB
    const allLocations = await database
      .collection('locations')
      .find({}, { projection: { name: 1, description: 1, imageUrl: 1, updatedAt: 1 } })
      .toArray();

    // Set up Fuse for approximate matching
    const fuse = new Fuse(allLocations, {
      keys: ['name'],
      threshold: 0.4,
    });

    // Map each locationName to the best match from allLocations
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
          database.collection('avatars').findOne(
            { name: entry.actor },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ) ||
          database.collection('avatars').findOne(
            {
              name: {
                $regex: `^${escapeRegExp(entry.actor)}$`,
                $options: 'i',
              },
            },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ),
          entry.target
            ? database.collection('avatars').findOne(
              { name: entry.target },
              { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
            ) ||
            database.collection('avatars').findOne(
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

        const [actorThumb, targetThumb] = await Promise.all([
          actor?.imageUrl
            ? thumbnailService.generateThumbnail(actor.imageUrl)
            : null,
          target?.imageUrl
            ? thumbnailService.generateThumbnail(target.imageUrl)
            : null,
        ]);

        // 2) Fetch stats
        const [actorStats, targetStats] = await Promise.all([
          actor
            ? database.collection('dungeon_stats').findOne({
              avatarId: actor._id.toString(),
            })
            : null,
          target
            ? database.collection('dungeon_stats').findOne({
              avatarId: target._id.toString(),
            })
            : null,
        ]);

        // 3) Additional data based on action
        const additionalData = {};
        if (entry.action === 'remember') {
          const memory = await database.collection('memories').findOne({
            avatarId: actor?._id,
            timestamp: entry.timestamp,
          });
          if (memory) additionalData.memory = memory.content;
        } else if (entry.action === 'xpost') {
          const tweet = await database.collection('tweets').findOne({
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

// ---- Healthcheck ----

/**
 * GET /api/health
 * Basic health check endpoint.
 */
app.get('/api/health', async (req, res) => {
  try {
    ensureDbConnection();
    // Optionally, ping the DB to check connectivity
    // await db.command({ ping: 1 });

    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Database not connected',
      mongo: process.env.MONGO_URI ? 'configured' : 'not configured',
    });
  }
});

/**
 * GET /api/avatars/:id
 * Returns full avatar details, including ancestry, stats, and name-based variants.
 */
app.get('/api/avatars/:id', async (req, res) => {
  try {
    const database = ensureDbConnection();
    const avatarId = ObjectId.createFromTime(req.params.id);

    const avatar = await database.collection('avatars').findOne({ _id: avatarId });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // In parallel: ancestry, variants, stats
    const [ancestry, variants, stats] = await Promise.all([
      getAvatarAncestry(database, avatarId),
      database
        .collection('avatars')
        .find({ name: avatar.name })
        .sort({ createdAt: -1 })
        .toArray(),
      database.collection('dungeon_stats').findOne({
        $or: [{ avatarId }, { avatarId: avatarId.toString() }],
      }),
    ]);

    // Generate thumbnails for each variant
    const thumbs = await Promise.all(
      variants.map((v) =>
        thumbnailService.generateThumbnail(v.imageUrl)
      )
    );

    res.json({
      ...avatar,
      ancestry,
      stats: stats || { attack: 0, defense: 0, hp: 0 },
      variants: variants.map((v, i) => ({
        ...v,
        thumbnailUrl: thumbs[i],
      })),
    });
  } catch (error) {
    console.error('Error fetching avatar details:', error);
    res.status(500).json({ error: error.message });
  }
});

// ---- Graceful Shutdown ----

process.on('SIGINT', async () => {
  try {
    await mongoClient.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Avatar claim endpoint
app.post('/api/avatars/:avatarId/claim', async (req, res) => {
  try {
    const { avatarId } = req.params;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    const avatar = await db.collection('avatars').findOne({
      _id: ObjectId.createFromHexString(avatarId)
    });

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // Check if avatar is already claimed
    const existingClaim = await db.collection('x_auth').findOne({ avatarId });
    if (existingClaim) {
      return res.status(400).json({ error: 'Avatar already claimed' });
    }

    // Update avatar status
    await db.collection('avatars').updateOne(
      { _id: ObjectId.createFromHexString(avatarId) },
      { $set: { claimed: true, claimedBy: walletAddress } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error claiming avatar:', error);
    res.status(500).json({ error: error.message });
  }
});

export default app;