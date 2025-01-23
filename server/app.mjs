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
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGO_DB_NAME || 'cosyworld';
const mongoClient = new MongoClient(mongoUri);
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

    const hostInfo =
      mongoClient?.options?.srvHost ||
      mongoClient?.options?.hosts?.[0] ||
      'unknown host';
    console.log(`Connected to MongoDB at: ${hostInfo}`);

    // Initialize indexes
    await initializeIndexes(db);

    // Mount external routes
    app.use('/api/avatars', await avatarRoutes(db));
    app.use('/api/tribes', await tribeRoutes(db));
    app.use('/api/xauth', await xauthRoutes(db));
    app.use('/api/wiki', await wikiRoutes);
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
 * Returns array of ancestors (parents of an avatar) by iterating up the family tree.
 * @param {import('mongodb').Db} db
 * @param {string|ObjectId} avatarId
 * @returns {Promise<Array>} The ancestry chain from child to oldest parent.
 */
async function getAvatarAncestry(db, avatarId) {
  const ancestry = [];
  let currentAvatar = await db.collection('avatars').findOne(
    { _id: new ObjectId(avatarId) },
    { projection: { parents: 1 } }
  );

  while (currentAvatar?.parents?.length) {
    // If parents is an array of ObjectId or string IDs, we do:
    const parentId = currentAvatar.parents[0];
    const parent = await db.collection('avatars').findOne(
      { _id: new ObjectId(parentId) }, // <--- fix from createFromTime()
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
 * Returns top minted NFTs with stats; up to 100 results sorted by score.
 */
app.get('/api/leaderboard/minted', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

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
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const { tier, lastMessageCount, lastId } = req.query;
    const limit = parseInt(req.query.limit, 10) || 24;

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
      // 3) Lookup avatars that match the case-insensitive username
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

    // Tier filter if any
    if (tier && tier !== 'All') {
      if (tier === 'U') {
        // Untiered
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
    // Warning: _id here is a string from $group, so $gt is lexical
    if (lastMessageCount && lastId) {
      pipeline.push({
        $match: {
          $or: [
            { messageCount: { $lt: parseInt(lastMessageCount, 10) } },
            {
              $and: [
                { messageCount: parseInt(lastMessageCount, 10) },
                { _id: { $gt: lastId } },
              ],
            },
          ],
        },
      });
    }

    // Limit + 1 for "hasMore"
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
          recentMessages: result.recentMessages
            .filter((m) => m !== null)
            .slice(0, 5),
          stats: stats || { attack: 0, defense: 0, hp: 0 },
          score: result.messageCount, // or any custom formula
        };
      })
    );

    const filtered = details.filter(Boolean);
    const hasMore = results.length > limit;

    // The "last item" for pagination reference
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
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);

    // Fetch data in parallel
    const [narratives, messages, dungeonStats] = await Promise.all([
      db
        .collection('narratives')
        .find({ avatarId })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray(),
      db
        .collection('messages')
        .find({ avatarId })
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray(),
      db.collection('dungeon_stats').findOne({ avatarId }),
    ]);

    // Generate stats if they don't exist
    if (!dungeonStats) {
      const { StatGenerationService } = await import('../src/services/statGenerationService.mjs');
      const statService = new StatGenerationService();
      const avatar = await db.collection('avatars').findOne({ _id: avatarId });
      const generatedStats = statService.generateStatsFromDate(avatar?.createdAt || new Date());

      dungeonStats = await db.collection('dungeon_stats').findOneAndUpdate(
        { avatarId },
        { $set: { ...generatedStats, avatarId } },
        { upsert: true, returnDocument: 'after' }
      );
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
    if (!db) throw new Error('Database not connected');

    const id = req.params.id;
    // Some stored as strings, some as ObjectId. Support both:
    const query = {
      $or: [{ avatarId: new ObjectId(id) }, { avatarId: id }],
    };

    const memories = await db
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
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);
    const avatar = await db
      .collection('avatars')
      .findOne({ _id: avatarId }, { projection: { name: 1 } });

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const actions = await db
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
 * Returns up to 5 avatars whose name matches the query.
 */
app.get('/api/avatars/search', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

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

    // Generate thumbnails in parallel
    const avatars = await Promise.all(
      found.map(async (avatar) => ({
        ...avatar,
        thumbnailUrl: await thumbnailService.generateThumbnail(
          avatar.imageUrl
        ),
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
 * Returns up to 50 latest combat logs, enriched with actor/target stats & additional data.
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

    // Get unique location names from move actions
    const locationNames = [...new Set(
      combatLog
        .filter(log => log.action === 'move' && log.target)
        .map(log => log.target)
    )];

    // Fetch location details
    const locationDetails = await db.collection('locations')
      .find({ name: { $in: locationNames } })
      .toArray()
      .then(locations => locations.reduce((acc, loc) => {
        if (!acc[loc.name] || new Date(loc.updatedAt) > new Date(acc[loc.name].updatedAt)) {
          acc[loc.name] = loc;
        }
        return acc;
      }, {}));

    // Enrich each log entry
    const enrichedLog = await Promise.all(
      combatLog.map(async (entry) => {
        // 1) Find Avatars for actor & target
        const [actor, target] = await Promise.all([
          db.collection('avatars').findOne(
            { name: entry.actor },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ) ||
            db.collection('avatars').findOne(
              { name: { $regex: `^${escapeRegExp(entry.actor)}$`, $options: 'i' } },
              { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
            ),
          entry.target
            ? db.collection('avatars').findOne(
              { name: entry.target },
              { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
            ) ||
              db.collection('avatars').findOne(
                { name: { $regex: `^${escapeRegExp(entry.target)}$`, $options: 'i' } },
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
            ? db
              .collection('dungeon_stats')
              .findOne({ avatarId: actor._id.toString() })
            : null,
          target
            ? db
              .collection('dungeon_stats')
              .findOne({ avatarId: target._id.toString() })
            : null,
        ]);

        // 3) Additional data based on action
        let additionalData = {};
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

        // Add location details if available
        const location = locationDetails[entry.target] || {};
        additionalData.location = {
          name: location.name,
          imageUrl: location.imageUrl,
          description: location.description
        }

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
 * Returns full avatar details, including ancestry, stats, and name-based variants.
 */
app.get('/api/avatars/:id', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const avatarId = new ObjectId(req.params.id);
    const avatar = await db.collection('avatars').findOne({ _id: avatarId });
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // In parallel: ancestry, variants, stats
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

export default app;