
import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

async function prepareWiki() {
  // Create dist directory
  await fs.mkdir('dist', { recursive: true });
  
  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db(process.env.MONGO_DB_NAME);

  // Fetch recent messages
  const messages = await db.collection('messages')
    .find({})
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();

  // Fetch associated avatars
  const avatarIds = [...new Set(messages.map(m => m.avatarId))];
  const avatars = await db.collection('avatars')
    .find({ _id: { $in: avatarIds } })
    .toArray();

  // Create messages data structure
  const messageData = messages.map(msg => ({
    ...msg,
    avatar: avatars.find(a => a._id.toString() === msg.avatarId?.toString())
  }));

  // Write to data file
  await fs.writeFile(
    'dist/messages.json',
    JSON.stringify(messageData, null, 2)
  );

  await client.close();
}

prepareWiki().catch(console.error);
