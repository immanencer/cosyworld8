import { ObjectId } from 'mongodb';
export function toObjectId(id) {
    if (id instanceof ObjectId) return id;
    try {
      return new ObjectId(id);
    } catch (error) {
      throw new Error(`Invalid ID: ${id}`);
    }
  }