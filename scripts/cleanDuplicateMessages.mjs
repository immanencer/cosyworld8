// clean_duplicates.js
import { MongoClient } from 'mongodb';

import { configDotenv } from 'dotenv';
configDotenv();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'; // or your connection string
const dbName = 'cosyworld8';
const collectionName = 'messages';

async function cleanDuplicates() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Step 1: Find duplicates
    const duplicates = await collection.aggregate([
      { $group: { _id: '$messageId', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    console.log(`Found ${duplicates.length} duplicate messageIds`);

    // Step 2: Remove duplicates
    for (const doc of duplicates) {
      const idsToDelete = doc.ids.slice(1); // Keep one, delete the rest
      const result = await collection.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`Removed ${result.deletedCount} duplicates for messageId ${doc._id}`);
    }

    console.log('Duplicate cleanup completed.');

    // Step 3: Create unique index
    await collection.createIndex({ messageId: 1 }, { unique: true });
    console.log('Unique index created on messageId');

  } catch (err) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await client.close();
  }
}

cleanDuplicates();
