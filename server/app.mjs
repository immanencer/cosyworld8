import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import models from '../src/models.config.mjs';
import avatarRoutes from './routes/avatars.mjs';
import tribeRoutes from './routes/tribes.mjs';
import xauthRoutes from './routes/xauth.mjs';
import wikiRoutes from './routes/wiki.mjs';
import { thumbnailService } from './services/thumbnailService.mjs';

const app = express();
const port = process.env.PORT || 3080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'cosyworld';
const mongoClient = new MongoClient(mongoUri);

// Shared MongoDB reference, assigned once connected
let db = null;

/**
 * Initialize all required indexes in the database.
 * @param {import('mongodb').Db} db
 */
async function initializeIndexes(db) {
  try {
    // Avatars
    await db.collection('avatars').createIndexes([
      { key: { name: 1 }, background: true },
      { key: { emoji: 1 }, background: true },
      { key: { parents: 1 }, background: true },
      { key: { model: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { name: 'text', description: 'text' }, background: true },
    ]);

    // Messages
    await db.collection('messages').createIndexes([
      { key: { authorUsername: 1 }, background: true },
      { key: { timestamp: -1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    // Narratives
    await db.collection('narratives').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Memories
    await db.collection('memories').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true },
    ]);

    // Dungeon Stats
    await db.collection('dungeon_stats').createIndexes([
      { key: { avatarId: 1 }, background: true, unique: true },
    ]);

    // Dungeon Log
    await db.collection('dungeon_log').createIndexes([
      { key: { timestamp: -1 }, background: true },
      { key: { actor: 1 }, background: true },
      { key: { target: 1 }, background: true },
    ]);

    // Token Transactions
    await db.collection('token_transactions').createIndexes([
      { key: { walletAddress: 1, timestamp: -1 }, background: true },
      { key: { transactionSignature: 1 }, unique: true },
    ]);

    // Minted NFTs
    await db.collection('minted_nfts').createIndexes([
      { key: { walletAddress: 1 }, background: true },
      { key: { avatarId: 1 }, background: true },
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    // Not throwing here; missing indexes is not fatal to the app
  }
}

// Attempt to connect to MongoDB once during startup
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set in environment variables, using default localhost');
    }

    await mongoClient.connect();
    db = mongoClient.db(mongoDbName);

    // MongoClient doesn't always populate these fields, so fallback to 'unknown'
    const hostInfo =
      mongoClient.options.srvHost ||
      mongoClient.options.hosts?.[0] ||
      'unknown host';
    console.log(`Connected to MongoDB at: ${hostInfo}`);

    // Initialize indexes
    await initializeIndexes(db);

    // Mounting external routes (each route file is passed `db` where needed)
    app.use('/api/avatars', await avatarRoutes(db));
    app.use('/api/tribes', await tribeRoutes(db)); // Ensure db is passed here
    app.use('/api/xauth', await xauthRoutes(db));
    app.use('/api/wiki', await wikiRoutes);

    // Start Server
    app.listen(process.env.PORT || 80, '0.0.0.0', () => {
      const listeningPort = process.env.PORT || 80;
      console.log(`Server running at http://0.0.0.0:${listeningPort}`);
      console.log('Available endpoints:');
      console.log('- GET /api/health');
      console.log('- GET /api/leaderboard');
      console.log('- GET /api/avatar/:id/narratives (x2 definitions)');
      console.log('- GET /api/avatar/:id/memories');
      console.log('- GET /api/avatar/:id/dungeon-actions');
      console.log('- GET /api/avatars/search');
      console.log('- GET /api/avatars/:id');
      console.log('- GET /api/dungeon/log');
      console.log('- GET /api/tribes');
      console.log('- GET /api/xauth');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Please check if:');
    console.error('1. MongoDB is running');
    console.error('2. MONGO_URI environment variable is set correctly');
    console.error('3. Network allows connection to MongoDB');
    process.exit(1);
  }
})().catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Helper: Rarity to tier
const rarityToTier = {
  legendary: 'S',
  rare: 'A',
  uncommon: 'B',
  common: 'C',
};

// Helper: Escape RegEx
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns array of ancestors (parents of an avatar) by iterating up the family tree.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} avatarId
 * @returns {Promise<Array>} - The ancestry chain from child to oldest parent.
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
      { _id: ObjectId.createFromTime(parentId) },
      { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1, parents: 1 } }
    );
    if (!parent) break;
    ancestry.push(parent);
    currentAvatar = parent;
  }

  return ancestry;
}

/**
 * Leaderboard Endpoint
 * - Aggregates messages by username
 * - Looks up any avatars that match that username
 * - Returns a paginated + possibly tier-filtered leaderboard
 */
app.get('/api/leaderboard/minted', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const mintedAvatars = await db.collection('minted_nfts')
      .aggregate([
        {
          $lookup: {
            from: 'avatars',
            localField: 'avatarId',
            foreignField: '_id',
            as: 'avatar'
          }
        },
        { $unwind: '$avatar' },
        {
          $lookup: {
            from: 'dungeon_stats',
            localField: 'avatarId',
            foreignField: 'avatarId',
            as: 'stats'
          }
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
                { $multiply: [{ $ifNull: ['$stats.hp', 0] }, 10] }
              ]
            }
          }
        },
        { $sort: { score: -1 } },
        { $limit: 100 }
      ]).toArray();

    res.json(mintedAvatars);
  } catch (error) {
    console.error('Minted leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

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
      // 2) Sort by messageCount (descending)
      { $sort: { messageCount: -1 } },
      // 3) Lookup avatars that match the case-insensitive username
      {
        $lookup: {
          from: 'avatars',
          let: { username: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: [{ $toLower: '$name' }, '$$username'] },
              },
            },
            { $sort: { createdAt: -1 } },
          ],
          as: 'variants',
        },
      },
      // 4) Filter out any docs that have no avatars
      { $match: { 'variants.0': { $exists: true } } },
    ];

    // Optional Tier Filter
    const { tier } = req.query;
    if (tier && tier !== 'All') {
      // 'U' means "un-tiered" (no recognized model)
      if (tier === 'U') {
        pipeline.push({
          $match: {
            $or: [
              { 'variants.0.model': { $exists: false } },
              { 'variants.0.model': null },
              {
                'variants.0.model': { $nin: models.map((m) => m.model) },
              },
            ],
          },
        });
      } else {
        // Filter by model whose rarity => tier
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

    // Pagination
    const lastMessageCount = parseInt(req.query.lastMessageCount, 10);
    const lastId = req.query.lastId;
    if (lastMessageCount && lastId) {
      pipeline.push({
        $match: {
          $or: [
            { messageCount: { $lt: lastMessageCount } },
            {
              $and: [
                { messageCount: lastMessageCount },
                { _id: { $gt: lastId } },
              ],
            },
          ],
        },
      });
    }

    // Limit + 1 for "hasMore" detection
    const limit = parseInt(req.query.limit, 10) || 24;
    pipeline.push({ $limit: limit + 1 });

    const results = await db
      .collection('messages')
      .aggregate(pipeline, { allowDiskUse: true })
      .toArray();

    // Ensure avatars are fetched correctly
    const avatars = await db.collection('avatars').find({}).toArray();

    // For each aggregated result, pick the "primary" avatar and compute ancestry + stats
    const avatarDetails = await Promise.all(
      results.map(async (result) => {
        const variants = result.variants;
        const primaryAvatar = variants[0];
        if (!primaryAvatar) return null;

        const thumbnails = await Promise.all(
          variants.map((v) => thumbnailService.generateThumbnail(v.imageUrl))
        );

        // Get ancestry and stats for the primary avatar
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
            thumbnailUrl: thumbnails[i],
          })),
          ancestry,
          messageCount: result.messageCount,
          lastMessage: result.lastMessage,
          // Filter out null entries and keep only up to 5
          recentMessages: result.recentMessages.filter((m) => m !== null).slice(0, 5),
          stats: stats || { attack: 0, defense: 0, hp: 0 },
          score: result.messageCount, // Calculate score based on message count
        };
      })
    );

    // Filter out any null avatarDetail
    const filteredDetails = avatarDetails.filter(Boolean);

    const hasMore = results.length > limit;
    const avatarsToReturn = results.slice(0, limit);
    const lastItem = avatarsToReturn[avatarsToReturn.length - 1];

    return res.json({
      avatars: filteredDetails,
      hasMore,
      total: filteredDetails.length,
      lastMessageCount: lastItem?.messageCount || null,
      lastId: lastItem?._id || null,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * First GET /api/avatar/:id/narratives route
 * This one returns an object: { narratives, recentMessages, dungeonStats }
 */
app.get('/api/avatar/:id/narratives', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);
    // Fetch data in parallel
    const [narratives, messages, dungeonStats] = await Promise.all([
      db.collection('narratives').find({ avatarId }).sort({ timestamp: -1 }).limit(10).toArray(),
      db.collection('messages').find({ avatarId }).sort({ timestamp: -1 }).limit(5).toArray(),
      db.collection('dungeon_stats').findOne({ avatarId }),
    ]);

    res.json({
      narratives,
      recentMessages: messages,
      dungeonStats: dungeonStats || { attack: 0, defense: 0, hp: 0 },
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
 * Memories Endpoint
 * - Returns up to 10 recent memories for the given avatarId
 */
app.get('/api/avatar/:id/memories', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const memories = await db
      .collection('memories')
      .find({
        $or: [
          { avatarId: new ObjectId(req.params.id) },
          { avatarId: req.params.id },
        ],
      })
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
 * Second GET /api/avatar/:id/narratives route
 * This one returns an array of narratives directly
 * (By default, in Express, this overrides the above route if the paths are identical)
 */
app.get('/api/avatar/:id/narratives', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const narratives = await db
      .collection('narratives')
      .find({ avatarId: new ObjectId(req.params.id) })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json(narratives);
  } catch (error) {
    console.error('Error fetching narratives (second route):', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dungeon-Actions Endpoint
 * - Returns up to 10 latest actions in the dungeon log for this avatar
 */
app.get('/api/avatar/:id/dungeon-actions', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);
    const avatar = await db.collection('avatars').findOne(
      { _id: avatarId },
      { projection: { name: 1 } }
    );

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const actions = await db
      .collection('dungeon_log')
      .find({ $or: [{ actor: avatar.name }, { target: avatar.name }] })
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
 * Avatar Search Endpoint
 */
app.get('/api/avatars/search', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { name } = req.query;
    if (!name || name.length < 2) {
      return res.json({ avatars: [] });
    }

    const escapedName = escapeRegExp(name);
    const avatars = await db
      .collection('avatars')
      .find({ name: { $regex: escapedName, $options: 'i' } })
      .limit(5)
      .toArray();

    const avatarsWithThumbs = await Promise.all(
      avatars.map(async (avatar) => ({
        ...avatar,
        thumbnailUrl: await thumbnailService.generateThumbnail(avatar.imageUrl),
      }))
    );

    res.json({ avatars: avatarsWithThumbs });
  } catch (error) {
    console.error('Avatar search error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dungeon Log Endpoint
 * - Returns up to 50 latest combat logs, enriched with actor/target info
 */
app.get('/api/dungeon/log', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const combatLog = await db
      .collection('dungeon_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    const enrichedLog = await Promise.all(
      combatLog.map(async (entry) => {
        // Try exact match first, then case-insensitive
        const [actor, target] = await Promise.all([
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

        const [actorThumb, targetThumb] = await Promise.all([
          actor?.imageUrl
            ? thumbnailService.generateThumbnail(actor.imageUrl)
            : null,
          target?.imageUrl
            ? thumbnailService.generateThumbnail(target.imageUrl)
            : null,
        ]);

        return {
          ...entry,
          actorId: actor?._id || null,
          targetId: target?._id || null,
          actorName: actor?.name || entry.actor,
          actorEmoji: actor?.emoji || null,
          actorImageUrl: actor?.imageUrl || null,
          actorThumbnailUrl: actorThumb,
          targetName: target?.name || entry.target,
          targetEmoji: target?.emoji || null,
          targetImageUrl: target?.imageUrl || null,
          targetThumbnailUrl: targetThumb,
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
 * Tribes Endpoint
 * - Replaces your "family-tree" endpoint
 * - Groups avatars by emoji
 */
app.get('/api/tribes', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const pipeline = [
      { $match: { emoji: { $exists: true, $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$emoji',
          count: { $sum: 1 },
          members: { $push: '$$ROOT' },
        },
      },
      { $match: { count: { $gt: 0 } } },
      { $sort: { count: -1 } },
    ];

    const tribes = await db.collection('avatars').aggregate(pipeline).toArray();

    // For each tribe, compute messageCount for each member and add a thumbnailUrl
    const tribesWithData = await Promise.all(
      tribes.map(async (tribe) => {
        const members = await Promise.all(
          tribe.members.map(async (member) => {
            const messageCount = await db.collection('messages').countDocuments({
              $expr: {
                $eq: [{ $toLower: '$authorUsername' }, member.name.toLowerCase()],
              },
            });
            const thumbnailUrl = await thumbnailService.generateThumbnail(member.imageUrl);
            return {
              ...member,
              score: messageCount,
              thumbnailUrl,
            };
          })
        );
        return {
          emoji: tribe._id,
          count: tribe.count,
          members,
        };
      })
    );

    res.json(tribesWithData);
  } catch (error) {
    console.error('Tribes error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  if (!db) {
    return res.status(503).json({
      status: 'error',
      message: 'Database not connected',
      mongo: process.env.MONGO_URI ? 'configured' : 'not configured',
    });
  }
  res.json({ status: 'ok', database: 'connected' });
});

/**
 * GET /api/avatars/:id
 * - Returns full avatar details, including ancestry, stats, and all name-based variants
 */
app.get('/api/avatars/:id', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);
    const avatar = await db.collection('avatars').findOne({ _id: avatarId });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const [ancestry, variants, stats] = await Promise.all([
      getAvatarAncestry(db, avatarId),
      db
        .collection('avatars')
        .find({ name: avatar.name })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection('dungeon_stats').findOne({
        $or: [{ avatarId }, { avatarId: avatarId.toString() }],
      }),
    ]);

    const thumbnails = await Promise.all(
      variants.map((v) => thumbnailService.generateThumbnail(v.imageUrl))
    );

    res.json({
      ...avatar,
      ancestry,
      stats: stats || { attack: 0, defense: 0, hp: 0 },
      variants: variants.map((v, i) => ({
        ...v,
        thumbnailUrl: thumbnails[i],
      })),
    });
  } catch (error) {
    console.error('Error fetching avatar details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Graceful Shutdown
 */
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

export default app;