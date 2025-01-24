
import { MongoClient } from 'mongodb';
import { StatGenerationService } from '../statGenerationService.mjs';

const client = new MongoClient(process.env.MONGO_URI);

async function updateAvatarScores() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME || 'discord-bot');
    
    // Get all avatars
    const avatars = await db.collection('avatars').find({}).toArray();
    
    // Calculate scores per avatar
    const scores = new Map();
    
    for (const avatar of avatars) {
      try {
        // Get messages count
        const messageCount = await db.collection('messages')
          .countDocuments({ 
            authorUsername: { $regex: new RegExp(avatar.name, 'i') }
          });

        // Get dungeon stats
        const stats = await db.collection('dungeon_stats')
          .findOne({ avatarId: avatar._id });

        // Generate stats if none exist
        const finalStats = stats || new StatGenerationService()
          .generateStatsFromDate(avatar.createdAt || new Date());

        // Calculate score based on messages and stats
        const score = messageCount * 10 + 
          (finalStats.hp || 0) * 5 +
          (finalStats.strength || 0) * 3 + 
          (finalStats.dexterity || 0) * 3;

        scores.set(avatar._id.toString(), {
          name: avatar.name,
          score: Math.max(0, score),
          stats: finalStats,
          updatedAt: new Date()
        });
      } catch (err) {
        console.error(`Error processing avatar ${avatar.name}:`, err);
      }
    }
    
    // Update scores in a new collection
    const ops = Array.from(scores.entries()).map(([id, data]) => ({
      updateOne: {
        filter: { avatarId: id },
        update: { $set: data },
        upsert: true
      }
    }));
    
    if (ops.length > 0) {
      await db.collection('avatar_scores').bulkWrite(ops);
      console.log(`Updated scores for ${ops.length} avatars`);
    }
    
  } catch (error) {
    console.error('Error updating scores:', error);
  }
}

// Run immediately and then every minute
updateAvatarScores();
setInterval(updateAvatarScores, 60 * 1000);
