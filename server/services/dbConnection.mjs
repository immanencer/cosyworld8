import { MongoClient } from 'mongodb';

let client = null;

export async function getDbConnection() {
    if (!client) {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
    }
    return client;
}

export async function getDb() {
    const client = await getDbConnection();
    return client.db(process.env.MONGO_DB_NAME);
}

// Optional: Handle graceful shutdown
process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        client = null;
    }
    process.exit(0);
});