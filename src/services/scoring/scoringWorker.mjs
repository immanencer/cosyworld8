
import { MongoClient } from 'mongodb';

// Connect to MongoDB
const client = new MongoClient(process.env.MONGO_URI);

async function updateAvatarScores() {
  try {
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME || 'discord-bot');
    
    // Get all messages grouped by avatar
    const messages = await db.collection('messages')
      .find({})
      .toArray();
      
    // Calculate scores per avatar
    const scores = new Map();
    
    for (const msg of messages) {
      const avatarName = msg.authorUsername?.toLowerCase();
      if (!avatarName) continue;
      
      scores.set(avatarName, (scores.get(avatarName) || 0) + 1);
    }
    
    // Update scores in a new collection
    const ops = Array.from(scores.entries()).map(([name, score]) => ({
      updateOne: {
        filter: { name: name },
        update: { $set: { score: score, updatedAt: new Date() }},
        upsert: true
      }
    }));
    
    if (ops.length > 0) {
      await db.collection('avatar_scores').bulkWrite(ops);
    }
    
  } catch (error) {
    console.error('Error updating scores:', error);
  } finally {
    await client.close();
  }
}

// Run immediately and then every 5 minutes
updateAvatarScores();
setInterval(updateAvatarScores, 5 * 60 * 1000);
