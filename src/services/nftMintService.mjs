import { getDb } from '../../server/services/dbConnection.mjs';

export class NFTMintingService {
  constructor(connection) {
    this.connection = connection;
  }

  async getRandomUnmintedAvatar() {
    const db = await getDb();
    const unmintedAvatars = await db.collection('avatars')
      .aggregate([
        { 
          $lookup: {
            from: 'minted_nfts',
            localField: '_id',
            foreignField: 'avatarId',
            as: 'mints'
          }
        },
        { $match: { 
          'mints': { $size: 0 },
          'status': { $ne: 'dead' }
        }},
        { $sample: { size: 1 } }
      ]).toArray();

    return unmintedAvatars[0];
  }

  async getAvatarsByOwner(publicKey) {
    const db = await getDb();
    return db.collection('minted_nfts')
      .aggregate([
        { $match: { walletAddress: publicKey }},
        { $lookup: {
          from: 'avatars',
          localField: 'avatarId',
          foreignField: '_id',
          as: 'avatar'
        }},
        { $unwind: '$avatar' },
        { $replaceRoot: { newRoot: '$avatar' }}
      ]).toArray();
  }

  async insertRequestIntoMongo(walletAddress, imageUrl) {
    try {
      if (!this.db) {
        this.db = await getDb();
      }
      const result = await this.db.collection('mint_requests').insertOne({
        walletAddress,
        imageUrl,
        status: 'pending',
        timestamp: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error inserting mint request:', error);
      throw error;
    }
  }
}