import { ObjectId } from 'mongodb';
export function toObjectId(id) {
    if (id instanceof ObjectId) return id;
    try {
      return new ObjectId(id);
    } catch (error) {
      this.logger.error(`Invalid ID format: ${id}`);
      throw new Error(`Invalid ID: ${id}`);
    }
  }