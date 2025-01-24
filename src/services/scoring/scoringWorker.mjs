import { MongoClient } from 'mongodb';
import { StatGenerationService } from '../statGenerationService.mjs';

// Recommended: Ensure proper indexes, e.g. { authorUsername: 1 } 
// in the "messages" collection to speed up the countDocuments query.

const client = new MongoClient(process.env.MONGO_URI, {
  // For example, increase the pool size if necessary
  maxPoolSize: 20
});

let db;
let isUpdating = false;
const RUN_INTERVAL_MS = 60 * 1000; // 1 minute
const BATCH_SIZE = 5;

async function initDb() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME || 'discord-bot');
    console.log('Connected to MongoDB.');
  }
  return db;
}

async function updateAvatarScores() {
  // Prevent concurrent runs
  if (isUpdating) return;
  isUpdating = true;

  console.log('Starting updateAvatarScores() ...');
  console.time('updateAvatarScores total time');

  try {
    const db = await initDb();

    let totalProcessed = 0;
    let offset = 0;

    while (true) {
      // Fetch avatars in chunks
      console.log(`Loading up to ${BATCH_SIZE} avatars from offset ${offset} ...`);
      const avatars = await db.collection('avatars')
        .find({})
        .skip(offset)
        .limit(BATCH_SIZE)
        .toArray();

      const chunkCount = avatars.length;
      if (chunkCount === 0) {
        console.log('No more avatars found. Exiting chunk loop.');
        break;
      }

      // Process this chunk
      console.time(`Chunk offset ${offset}`);
      const scorePromises = avatars.map(async (avatar) => {
        try {
          // Fetch message count & dungeon stats in parallel
          const [messageCount, stats] = await Promise.all([
            db.collection('messages').countDocuments({
              authorUsername: { $regex: new RegExp(avatar.name, 'i') }
            }),
            db.collection('dungeon_stats').findOne({ avatarId: avatar._id })
          ]);

          // Generate stats if none exist
          const finalStats = stats 
            || new StatGenerationService().generateStatsFromDate(avatar.createdAt || new Date());

          // Calculate score
          const score = Math.max(
            0,
            messageCount * 10 +
            (finalStats.hp || 0) * 5 +
            (finalStats.strength || 0) * 3 +
            (finalStats.dexterity || 0) * 3
          );

          return {
            updateOne: {
              filter: { avatarId: avatar._id.toString() },
              update: {
                $set: {
                  name: avatar.name,
                  score,
                  stats: finalStats,
                  updatedAt: new Date()
                }
              },
              upsert: true
            }
          };
        } catch (err) {
          console.error(`Error processing avatar ${avatar.name}:`, err);
          return null;
        }
      });

      // Wait for all scores in this chunk
      const ops = (await Promise.all(scorePromises)).filter(Boolean);

      if (ops.length > 0) {
        await db.collection('avatar_scores').bulkWrite(ops);
        console.log(`   Updated scores for ${ops.length} avatars (this chunk).`);
      } else {
        console.log('   No valid avatar updates in this chunk.');
      }

      console.timeEnd(`Chunk offset ${offset}`);

      totalProcessed += chunkCount;
      offset += BATCH_SIZE;
    }

    console.log(`Finished processing. Total avatars processed: ${totalProcessed}`);
  } catch (error) {
    console.error('Error updating scores:', error);
  } finally {
    console.timeEnd('updateAvatarScores total time');
    isUpdating = false;
    // Schedule next run
    setTimeout(updateAvatarScores, RUN_INTERVAL_MS);
  }
}

// Kick off the first run
updateAvatarScores();
