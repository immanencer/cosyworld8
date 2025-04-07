import { ObjectId } from 'mongodb';

export class NFTMintingService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Marks the avatar as ready to mint and assigns it to the given wallet.
   * This will update the avatar document and upsert a claim record.
   */
  async markAvatarForMint(avatarId, walletAddress) {
    const avatarObjectId = new ObjectId(avatarId);

    // Update the avatar document to mark it as claimed
    await this.db.collection('avatars').updateOne(
      { _id: avatarObjectId },
      { $set: { claimed: true, claimedBy: walletAddress } }
    );

    // Upsert the avatar claim record with only the wallet and avatar id
    await this.db.collection('avatar_claims').updateOne(
      { avatarId: avatarObjectId },
      {
        $set: {
          walletAddress,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );

    return true;
  }

  /**
   * Retrieves avatars owned by the given wallet.
   * This now uses the consolidated avatar_claims collection.
   */
  async getAvatarsByOwner(walletAddress) {
    return this.db.collection('avatar_claims')
      .aggregate([
        { $match: { walletAddress } },
        {
          $lookup: {
            from: 'avatars',
            localField: 'avatarId',
            foreignField: '_id',
            as: 'avatar'
          }
        },
        { $unwind: '$avatar' },
        { $replaceRoot: { newRoot: '$avatar' } }
      ])
      .toArray();
  }
}
