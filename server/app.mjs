import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import models from '../src/models.config.mjs';
import avatarRoutes from './routes/avatars.mjs';
import familyRoutes from './routes/families.mjs'
import xauthRoutes from './routes/xauth.mjs';
import { thumbnailService } from './services/thumbnailService.mjs';

const app = express();
const port = process.env.PORT || 3080;

app.use(cors());
app.use(express.json());

// Add to app.mjs:

app.use(express.static('public'));

// Update MongoDB connection with better error handling
const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');

// Connect to MongoDB once during server startup
let db;
await (async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not set in environment variables, using default localhost');
    }
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGO_DB_NAME || 'cosyworld');
    console.log('Connected to MongoDB at:', mongoClient.options.srvHost || mongoClient.options.hosts?.[0] || 'unknown host');
    
    // Initialize indexes
    await initializeIndexes(db);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Please check if:');
    console.error('1. MongoDB is running');
    console.error('2. MONGO_URI environment variable is set correctly');
    console.error('3. Network allows connection to MongoDB');
    process.exit(1);
  }
})().catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Add this function after MongoDB connection setup
async function initializeIndexes(db) {
  try {
    // Indexes for avatars collection
    await db.collection('avatars').createIndexes([
      { key: { name: 1 }, background: true },
      { key: { emoji: 1 }, background: true },
      { key: { "parents": 1 }, background: true },
      { key: { model: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { name: "text", description: "text" }, background: true }
    ]);

    // Indexes for messages collection
    await db.collection('messages').createIndexes([
      { key: { authorUsername: 1 }, background: true },
      { key: { timestamp: -1 }, background: true },
      { key: { avatarId: 1 }, background: true }
    ]);

    // Indexes for narratives collection
    await db.collection('narratives').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true }
    ]);

    // Indexes for memories collection
    await db.collection('memories').createIndexes([
      { key: { avatarId: 1, timestamp: -1 }, background: true }
    ]);

    // Indexes for dungeon_stats collection
    await db.collection('dungeon_stats').createIndexes([
      { key: { avatarId: 1 }, background: true, unique: true }
    ]);

    // Indexes for dungeon_log collection
    await db.collection('dungeon_log').createIndexes([
      { key: { timestamp: -1 }, background: true },
      { key: { actor: 1 }, background: true },
      { key: { target: 1 }, background: true }
    ]);

    // Indexes for token transactions
    await db.collection('token_transactions').createIndexes([
      { key: { walletAddress: 1, timestamp: -1 }, background: true },
      { key: { transactionSignature: 1 }, unique: true }
    ]);

    // Indexes for minted NFTs
    await db.collection('minted_nfts').createIndexes([
      { key: { walletAddress: 1 }, background: true },
      { key: { avatarId: 1 }, background: true }
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    // Don't exit the process, as missing indexes isn't fatal
  }
}

const rarityToTier = {
  'legendary': 'S',
  'rare': 'A',
  'uncommon': 'B',
  'common': 'C'
};


// Add escapeRegExp function to sanitize avatar names for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}

// API Routes
app.use('/api/avatars', avatarRoutes(db));
app.use('/api/tribes', familyRoutes(db));
app.use('/api/xauth', xauthRoutes(db));
app.use('/api/tokens', tokenRoutes(db));

app.get('/api/leaderboard', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    
    const pipeline = [
      // Group messages by username
      {
        $group: {
          _id: { $toLower: '$authorUsername' },
          messageCount: { $sum: 1 },
          lastMessage: { $max: '$timestamp' },
          recentMessages: {
            $push: {
              $cond: {
                if: { $gte: ["$timestamp", { $subtract: [new Date(), 1000 * 60 * 60 * 24] }] },
                then: { content: { $substr: ["$content", 0, 200] }, timestamp: "$timestamp" },
                else: null
              }
            }
          }
        }
      },
      { $sort: { messageCount: -1 } },
      // Lookup all avatars with matching name
      {
        $lookup: {
          from: 'avatars',
          let: { username: '$_id' },
          pipeline: [
            { 
              $match: { 
                $expr: { $eq: [{ $toLower: '$name' }, '$$username'] }
              }
            },
            { $sort: { createdAt: -1 } }
          ],
          as: 'variants'
        }
      },
      { $match: { 'variants.0': { $exists: true } } }
    ];

    // Add tier filtering if needed
    const tierFilter = req.query.tier;
    if (tierFilter && tierFilter !== 'All') {
      if (tierFilter === 'U') {
        pipeline.push({
          $match: {
            $or: [
              { 'variants.0.model': { $exists: false } },
              { 'variants.0.model': null },
              { 'variants.0.model': { $nin: models.map(m => m.model) } }
            ]
          }
        });
      } else {
        pipeline.push({
          $match: {
            'variants.0.model': {
              $in: models
                .filter(m => rarityToTier[m.rarity] === tierFilter)
                .map(m => m.model)
            }
          }
        });
      }
    }

    // Add pagination
    const lastMessageCount = parseInt(req.query.lastMessageCount);
    const lastId = req.query.lastId;
    if (lastMessageCount && lastId) {
      pipeline.push({
        $match: {
          $or: [
            { messageCount: { $lt: lastMessageCount } },
            {
              $and: [
                { messageCount: lastMessageCount },
                { _id: { $gt: lastId } }
              ]
            }
          ]
        }
      });
    }

    const limit = parseInt(req.query.limit) || 24;
    pipeline.push({ $limit: limit + 1 });

    const results = await db.collection('messages')
      .aggregate(pipeline, { allowDiskUse: true })
      .toArray();

    const avatarDetails = await Promise.all(results.map(async (result) => {
      const variants = result.variants;
      const primaryAvatar = variants[0];
      const thumbnails = await Promise.all(
        variants.map(v => thumbnailService.generateThumbnail(v.imageUrl))
      );

      // Get ancestry and stats for primary avatar
      const [ancestry, stats] = await Promise.all([
        getAvatarAncestry(db, primaryAvatar._id),
        db.collection('dungeon_stats').findOne({
          $or: [
            { avatarId: primaryAvatar._id },
            { avatarId: primaryAvatar._id.toString() }
          ]
        })
      ]);

      return {
        ...primaryAvatar,
        variants: variants.map((v, i) => ({
          ...v,
          thumbnailUrl: thumbnails[i]
        })),
        ancestry,
        messageCount: result.messageCount,
        lastMessage: result.lastMessage,
        recentMessages: result.recentMessages.filter(m => m !== null).slice(0, 5),
        stats: stats || { attack: 0, defense: 0, hp: 0 }
      };
    }));

    const hasMore = results.length > limit;
    const avatarsToReturn = results.slice(0, limit);
    const lastItem = avatarsToReturn[avatarsToReturn.length - 1];

    return res.json({
      avatars: avatarDetails,
      hasMore,
      total: avatarDetails.length,
      lastMessageCount: lastItem?.messageCount || null,
      lastId: lastItem?._id || null
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add ancestry helper function
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

app.get('/api/avatar/:id/narratives', async (req, res) => {
  try {
    const avatarId = new ObjectId(req.params.id);
    
    // Fetch data in parallel
    const [narratives, messages, dungeonStats] = await Promise.all([
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
      db.collection('dungeon_stats')
        .findOne({ avatarId })
    ]);

    res.json({
      narratives,
      recentMessages: messages,
      dungeonStats: dungeonStats || { attack: 0, defense: 0, hp: 0 }
    });
  } catch (error) {
    console.error('Error fetching narratives:', error);
    res.status(500).json({ 
      error: error.message,
      narratives: [],
      recentMessages: [],
      dungeonStats: { attack: 0, defense: 0, hp: 0 }
    });
  }
});

// Add new endpoints for memories and narratives
app.get('/api/avatar/:id/memories', async (req, res) => {
  try {
    const memories = await db.collection('memories')
      .find({ 
        $or: [
          { avatarId: new ObjectId(req.params.id) },
          { avatarId: req.params.id }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    res.json({ memories }); // Wrap in object for consistency
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      memories: [] 
    });
  }
});

app.get('/api/avatar/:id/narratives', async (req, res) => {
  try {
    const narratives = await db.collection('narratives')
      .find({ avatarId: new ObjectId(req.params.id) })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    res.json(narratives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new endpoint for avatar's dungeon actions
app.get('/api/avatar/:id/dungeon-actions', async (req, res) => {
  try {
    const avatarId = new ObjectId(req.params.id);
    const avatar = await db.collection('avatars').findOne(
      { _id: avatarId },
      { projection: { name: 1 } }
    );
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    const actions = await db.collection('dungeon_log')
      .find({
        $or: [
          { actor: avatar.name },
          { target: avatar.name }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    res.json(actions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new search endpoint before the combat log endpoint
app.get('/api/avatars/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.length < 2) {
      return res.json({ avatars: [] });
    }

    const escapedName = escapeRegExp(name);
    const avatars = await db.collection('avatars')
      .find({ 
        name: { $regex: escapedName, $options: 'i' }
      })
      .limit(5)
      .toArray();

    const avatarsWithThumbs = await Promise.all(
      avatars.map(async (avatar) => ({
        ...avatar,
        thumbnailUrl: await thumbnailService.generateThumbnail(avatar.imageUrl)
      }))
    );

    res.json({ avatars: avatarsWithThumbs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhance combat log endpoint with more information
app.get('/api/dungeon/log', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    const combatLog = await db.collection('dungeon_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    const enrichedLog = await Promise.all(combatLog.map(async (entry) => {
      // Try exact match first, then case-insensitive
      const [actor, target] = await Promise.all([
        db.collection('avatars').findOne(
          { name: entry.actor },
          { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
        ) || db.collection('avatars').findOne(
          { name: { $regex: `^${escapeRegExp(entry.actor)}$`, $options: 'i' } },
          { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
        ),
        entry.target ? (
          db.collection('avatars').findOne(
            { name: entry.target },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          ) || db.collection('avatars').findOne(
            { name: { $regex: `^${escapeRegExp(entry.target)}$`, $options: 'i' } },
            { projection: { _id: 1, name: 1, imageUrl: 1, emoji: 1 } }
          )
        ) : null
      ]);

      const [actorThumb, targetThumb] = await Promise.all([
        actor?.imageUrl ? thumbnailService.generateThumbnail(actor.imageUrl) : null,
        target?.imageUrl ? thumbnailService.generateThumbnail(target.imageUrl) : null
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
    }));

    res.json(enrichedLog);
  } catch (error) {
    console.error('Error fetching combat log:', error);
    res.status(500).json({ error: error.message });
  }
});

// Replace family-tree endpoint with tribes endpoint
app.get('/api/tribes', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');

    // Get all avatars with emojis and group them
    const pipeline = [
      {
        $match: {
          emoji: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$emoji',
          count: { $sum: 1 },
          members: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 0 }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ];

    const tribes = await db.collection('avatars').aggregate(pipeline).toArray();

    // Add thumbnails for members
    const tribesWithThumbs = await Promise.all(
      tribes.map(async tribe => ({
        emoji: tribe._id,
        count: tribe.count,
        members: await Promise.all(
          tribe.members.map(async member => ({
            ...member,
            thumbnailUrl: await thumbnailService.generateThumbnail(member.imageUrl)
          }))
        )
      }))
    );

    res.json(tribesWithThumbs);
  } catch (error) {
    console.error('Tribes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  if (!db) {
    return res.status(503).json({ 
      status: 'error',
      message: 'Database not connected',
      mongo: process.env.MONGO_URI ? 'configured' : 'not configured'
    });
  }
  res.json({ 
    status: 'ok',
    database: 'connected'
  });
});

// Add new endpoint for full avatar details
app.get('/api/avatars/:id', async (req, res) => {
  try {
    const avatarId = new ObjectId(req.params.id);
    const avatar = await db.collection('avatars').findOne({ _id: avatarId });
    
    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // Get ancestry, variants and stats in parallel
    const [ancestry, variants, stats] = await Promise.all([
      getAvatarAncestry(db, avatarId),
      db.collection('avatars')
        .find({ name: avatar.name })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection('dungeon_stats').findOne({
        $or: [
          { avatarId: avatarId },
          { avatarId: avatarId.toString() }
        ]
      })
    ]);

    const thumbnails = await Promise.all(
      variants.map(v => thumbnailService.generateThumbnail(v.imageUrl))
    );

    res.json({
      ...avatar,
      ancestry,
      stats: stats || { attack: 0, defense: 0, hp: 0 },
      variants: variants.map((v, i) => ({
        ...v,
        thumbnailUrl: thumbnails[i]
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle server shutdown to close MongoDB connection
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

// Update server start logging
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/leaderboard');
  console.log('- GET /api/avatar/:id/narratives');
  console.log('- GET /api/dungeon/log');
  console.log('- GET /api/tribes');
  console.log('- GET /api/xauth');
});